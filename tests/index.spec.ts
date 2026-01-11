import {
  jest,
  describe,
  beforeEach,
  afterEach,
  expect,
  test,
} from "@jest/globals";
import axios, { AxiosInstance } from "axios";
import { WebSocket as ReconnectingWebSocket } from "partysocket";
import { MailpitClient } from "../src/index";

jest.mock("axios");

describe("MailpitClient", () => {
  let client: MailpitClient;
  let mockedAxios: jest.Mocked<AxiosInstance>;
  let internalClient: {
    connectWebSocket: () => void;
    disconnect: () => void;
    webSocket: ReconnectingWebSocket | null;
    onEvent: (
      eventType: string,
      listener: (event: unknown) => void,
    ) => () => void;
    waitForEvent: (
      eventType: string,
      timeout?: number,
    ) => Promise<{ Type: string; Data: unknown }>;
    eventListeners: Map<
      string,
      Set<(event: { Type: string; Data: unknown }) => void>
    >;
    handleWebSocketMessage: (message: { Type: string; Data: unknown }) => void;
    removeListener: (
      eventType: string,
      listener: (event: unknown) => void,
    ) => void;
  };

  beforeEach(() => {
    mockedAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      defaults: {},
    } as unknown as jest.Mocked<AxiosInstance>;

    // Mock axios.create to return our mocked instance
    (axios.create as jest.Mock).mockReturnValue(mockedAxios);

    // Type-safe mock of isAxiosError
    (axios.isAxiosError as unknown as jest.Mock).mockImplementation((error) => {
      return (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "AxiosError"
      );
    });

    client = new MailpitClient("http://localhost:8025");
    internalClient = client as unknown as typeof internalClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Methods that could be skipped in e2e if feature not enabled
  test("should call releaseMessage() and return ok", async () => {
    mockedAxios.post.mockResolvedValue({ data: "ok" });
    const result = await client.releaseMessage("id", { To: ["a@b.com"] });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/api/v1/message/id/release",
      { To: ["a@b.com"] },
    );
    expect(result).toBe("ok");
  });

  test("should call spamAssassinCheck() and return spam check response", async () => {
    const mockData = { Errors: 0, IsSpam: false, Rules: [], Score: 0 };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.spamAssassinCheck();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/api/v1/message/latest/sa-check",
    );
    expect(result).toEqual(mockData);
  });

  const mockData = {
    Authentication: {
      ErrorCode: 451,
      Probability: 5,
    },
    Recipient: {
      ErrorCode: 451,
      Probability: 5,
    },
    Sender: {
      ErrorCode: 451,
      Probability: 5,
    },
  };

  test("should call getChaosTriggers() and return triggers", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.getChaosTriggers();
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/chaos");
    expect(result).toEqual(mockData);
  });

  test("should call setChaosTriggers() and return ok", async () => {
    mockedAxios.put.mockResolvedValue({ data: mockData });
    const result = await client.setChaosTriggers();
    expect(mockedAxios.put).toHaveBeenCalledWith("/api/v1/chaos", {});
    expect(result).toEqual(mockData);
  });

  // Error handling cases
  test("should handle NOT AxiosError", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: "error" } });
    await expect(client.getInfo()).rejects.toThrow();
  });

  test("should handle AxiosError with a response", async () => {
    const error = {
      name: "AxiosError",
      message: "Response Error",
      config: { url: "/api/v1/info", method: "GET" },
      response: {
        status: 500,
        data: "Boom!",

        statusText: "Internal Server Error",
      },
    };
    mockedAxios.get.mockRejectedValue(error);
    await expect(client.getInfo()).rejects.toThrow(
      'Mailpit API Error: 500 Internal Server Error at GET /api/v1/info: "Boom!"',
    );
  });

  test("should handle AxiosError without a response but with a request", async () => {
    const error = {
      name: "AxiosError",
      config: { url: "/api/v1/info", method: "GET" },
      request: {},
    };
    mockedAxios.get.mockRejectedValue(error);
    await expect(client.getInfo()).rejects.toThrow(
      "Mailpit API Error: No response received from server at GET /api/v1/info",
    );
  });

  test("should handle AxiosError with no request, no response, no method, and no url", async () => {
    const error = {
      name: "AxiosError",
      message: "Something Other Error",
    };
    mockedAxios.get.mockRejectedValue(error);
    await expect(client.getInfo()).rejects.toThrow(
      /Mailpit API Error: .+ at UNKNOWN METHOD UNKNOWN URL/,
    );
  });

  // Constructor validation tests
  test("should throw error for malformed protocol", () => {
    expect(() => new MailpitClient("ht!tp://bad-url")).toThrow(
      "The value of the 'baseURL' parameter must start with http:// or https://",
    );
  });

  // WebSocket configuration tests (connection behavior is tested in E2E)
  test("should not auto-connect WebSocket by default", () => {
    const client = new MailpitClient("http://localhost:8025");
    expect(client["webSocket"]).toBeNull();
  });

  test("connectWebSocket() should return early when already connected", () => {
    const existingWebSocket = {
      readyState: ReconnectingWebSocket.OPEN,
    } as unknown as ReconnectingWebSocket;

    internalClient.webSocket = existingWebSocket;

    internalClient.connectWebSocket();

    expect(internalClient.webSocket).toBe(existingWebSocket);
  });

  test("disconnect() should do nothing when no WebSocket exists", () => {
    internalClient.webSocket = null;
    internalClient.disconnect();

    expect(internalClient.webSocket).toBeNull();
  });

  test("onEvent() should return unsubscribe function that removes listener", () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const unsubscribe1 = internalClient.onEvent("new", listener1);
    const unsubscribe2 = internalClient.onEvent("new", listener2);

    expect(internalClient.eventListeners.get("new")?.size).toBe(2);

    unsubscribe1();
    expect(internalClient.eventListeners.get("new")?.size).toBe(1);

    unsubscribe2();
    expect(internalClient.eventListeners.has("new")).toBe(false);
  });

  test("waitForEvent() should auto-connect when WebSocket is closed", () => {
    const closedWebSocket = {
      readyState: ReconnectingWebSocket.CLOSED,
    } as unknown as ReconnectingWebSocket;

    internalClient.webSocket = closedWebSocket;

    const promise = internalClient.waitForEvent("new", 100);

    expect(internalClient.webSocket).not.toBe(closedWebSocket);
    expect(internalClient.webSocket).not.toBeNull();

    // Clean up the promise to avoid unhandled rejection
    promise.catch(() => {});
  });

  test("waitForEvent() should timeout and remove listener", async () => {
    const promise = internalClient.waitForEvent("new", 50);

    await expect(promise).rejects.toThrow(
      'Timeout waiting for event of type "new"',
    );

    // Verify listener was cleaned up (Set should be empty)
    const listeners = internalClient.eventListeners.get("new");
    expect(listeners?.size || 0).toBe(0);
  });

  test("waitForEvent() should not timeout when passed Infinity", async () => {
    // Spy on the method and wrap it to provide a short default timeout
    const originalMethod = internalClient.waitForEvent.bind(internalClient);
    const spy = jest.fn((eventType: string, timeout: number = 50) => {
      return originalMethod(eventType, timeout);
    });
    internalClient.waitForEvent = spy;

    // Pass Infinity explicitly - message arrives at 100ms
    // The spy has a default timeout of 50ms, so if Infinity wasn't respected,
    // this test would fail with a timeout error at 50ms before the message arrives at 100ms
    const promise = internalClient.waitForEvent("new", Infinity);

    // Verify the method was called with Infinity
    expect(spy).toHaveBeenCalledWith("new", Infinity);

    // Verify listener was added
    const listeners = internalClient.eventListeners.get("new");
    expect(listeners?.size).toBe(1);

    // Simulate a message arriving after 100ms
    // This is longer than the 50ms default - proves Infinity disabled the timeout
    setTimeout(() => {
      internalClient.handleWebSocketMessage({
        Type: "new",
        Data: { ID: "test-123" },
      });
    }, 100);

    const result = await promise;

    expect(result.Type).toBe("new");
    expect(result.Data).toEqual({ ID: "test-123" });

    // Verify listener was cleaned up after resolution
    expect(internalClient.eventListeners.get("new")?.size || 0).toBe(0);
  });

  test("removeListener() should handle removeListener when no listeners exist", () => {
    const removeListener = internalClient.removeListener.bind(internalClient);

    // Call removeListener when there are no listeners registered
    // This should not throw an error
    expect(() => {
      removeListener("new", () => {});
    }).not.toThrow();
  });

  test("should silently ignore malformed JSON messages from WebSocket", () => {
    let capturedMessageHandler: ((event: { data: string }) => void) | null =
      null;

    // Mock the WebSocket constructor to capture the message handler
    const mockWebSocket = {
      readyState: ReconnectingWebSocket.OPEN,
      addEventListener: jest.fn(
        (event: string, handler: (e: { data: string }) => void) => {
          if (event === "message") {
            capturedMessageHandler = handler;
          }
        },
      ),
      removeEventListener: jest.fn(),
      close: jest.fn(),
    };

    // Mock the ReconnectingWebSocket constructor
    const originalWebSocket = ReconnectingWebSocket;
    (ReconnectingWebSocket as unknown as jest.Mock) = jest.fn(
      () => mockWebSocket,
    );

    const mockListener = jest.fn();
    client.onEvent("new", mockListener);

    // Trigger WebSocket connection
    internalClient.connectWebSocket();

    // Verify the message handler was captured
    expect(capturedMessageHandler).not.toBeNull();

    // Call the handler with malformed JSON - this should not throw
    expect(() => {
      capturedMessageHandler?.({ data: "{ this is not valid json }" });
    }).not.toThrow();

    // Verify listener was never called (malformed message was silently ignored)
    expect(mockListener).not.toHaveBeenCalled();

    // Restore the original WebSocket
    (ReconnectingWebSocket as unknown as typeof originalWebSocket) =
      originalWebSocket;
  });
});
