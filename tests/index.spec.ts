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
    const internalClient = client as unknown as {
      connectWebSocket: () => void;
      webSocket: ReconnectingWebSocket | null;
    };

    const existingWebSocket = {
      readyState: ReconnectingWebSocket.OPEN,
    } as unknown as ReconnectingWebSocket;

    internalClient.webSocket = existingWebSocket;

    internalClient.connectWebSocket();

    expect(internalClient.webSocket).toBe(existingWebSocket);
  });

  test("disconnectWebSocket() should do nothing when no WebSocket exists", () => {
    const internalClient = client as unknown as {
      disconnectWebSocket: () => void;
      webSocket: ReconnectingWebSocket | null;
    };

    internalClient.webSocket = null;
    internalClient.disconnectWebSocket();

    expect(internalClient.webSocket).toBeNull();
  });

  test("onWebSocketEvent() should return unsubscribe function that removes listener", () => {
    const internalClient = client as unknown as {
      onWebSocketEvent: (
        eventType: string,
        listener: (event: unknown) => void,
      ) => () => void;
      eventListeners: Map<string, Set<(event: unknown) => void>>;
    };

    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const unsubscribe1 = internalClient.onWebSocketEvent("new", listener1);
    const unsubscribe2 = internalClient.onWebSocketEvent("new", listener2);

    expect(internalClient.eventListeners.get("new")?.size).toBe(2);

    unsubscribe1();
    expect(internalClient.eventListeners.get("new")?.size).toBe(1);

    unsubscribe2();
    expect(internalClient.eventListeners.has("new")).toBe(false);
  });

  test("waitForWebSocketEvent() should auto-connect when WebSocket is closed", () => {
    const internalClient = client as unknown as {
      waitForWebSocketEvent: (
        eventType: string,
        timeout?: number,
      ) => Promise<unknown>;
      webSocket: ReconnectingWebSocket | null;
    };

    const closedWebSocket = {
      readyState: ReconnectingWebSocket.CLOSED,
    } as unknown as ReconnectingWebSocket;

    internalClient.webSocket = closedWebSocket;

    const promise = internalClient.waitForWebSocketEvent("new", 100);

    expect(internalClient.webSocket).not.toBe(closedWebSocket);
    expect(internalClient.webSocket).not.toBeNull();

    // Clean up the promise to avoid unhandled rejection
    promise.catch(() => {});
  });

  test("waitForWebSocketEvent() should timeout and remove listener", async () => {
    const internalClient = client as unknown as {
      waitForWebSocketEvent: (
        eventType: string,
        timeout?: number,
      ) => Promise<unknown>;
      eventListeners: Map<string, Set<(event: unknown) => void>>;
    };

    const promise = internalClient.waitForWebSocketEvent("new", 50);

    await expect(promise).rejects.toThrow(
      'Timeout waiting for WebSocket event of type "new"',
    );

    // Verify listener was cleaned up (Set should be empty)
    const listeners = internalClient.eventListeners.get("new");
    expect(listeners?.size || 0).toBe(0);
  });
});
