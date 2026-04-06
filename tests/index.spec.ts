import {
  vi,
  describe,
  beforeEach,
  afterEach,
  expect,
  test,
  type Mock,
} from "vitest";
import ReconnectingWebSocket from "partysocket/ws";
import { MailpitClient } from "../src/index";

// vi.hoisted ensures this Map is available inside the vi.mock() factory below,
// which vitest hoists before all imports.
const mockWebSocketHandlers = vi.hoisted(
  () => new Map<string, ((...args: never[]) => void)[]>(),
);

vi.mock("partysocket/ws", () => {
  // Must use a regular function (not arrow) so the mock can be used as a constructor
  // with `new ReconnectingWebSocket(...)`.
  const mock = vi.fn(function (this: Record<string, unknown>) {
    this.readyState = 1;
    this.addEventListener = vi.fn(
      (event: string, handler: (...args: never[]) => void) => {
        const handlers = mockWebSocketHandlers.get(event) ?? [];
        handlers.push(handler);
        mockWebSocketHandlers.set(event, handlers);
      },
    );
    this.removeEventListener = vi.fn();
    this.close = vi.fn();
  });
  Object.assign(mock, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
  return { default: mock };
});

/** Build a minimal fetch-compatible Response mock */
function mockJsonResponse(data: unknown, status = 200): Response {
  const body = JSON.stringify(data);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { get: () => "application/json" },
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(body),
    blob: () => Promise.resolve(new Blob([body])),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  } as unknown as Response;
}

function mockTextResponse(text: string, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { get: () => "text/plain" },
    json: () => Promise.reject(new SyntaxError("not json")),
    text: () => Promise.resolve(text),
    blob: () => Promise.resolve(new Blob([text])),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  } as unknown as Response;
}

describe("MailpitClient", () => {
  let client: MailpitClient;
  let mockFetch: Mock;
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
    waitForMessage: InstanceType<typeof MailpitClient>["waitForMessage"];
    waitForMessages: InstanceType<typeof MailpitClient>["waitForMessages"];
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
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    client = new MailpitClient("http://localhost:8025");
    internalClient = client as unknown as typeof internalClient;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mockWebSocketHandlers.clear();
  });

  test("should call setReadStatus() with no parameters and return ok", async () => {
    mockFetch.mockResolvedValue(mockTextResponse("ok"));
    const result = await client.setReadStatus();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8025/api/v1/messages");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body as string)).toEqual({});
    expect(result).toBe("ok");
  });

  // Methods that could be skipped in e2e if feature not enabled
  test("should call releaseMessage() and return ok", async () => {
    mockFetch.mockResolvedValue(mockTextResponse("ok"));
    const result = await client.releaseMessage("id", { To: ["a@b.com"] });
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8025/api/v1/message/id/release");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ To: ["a@b.com"] });
    expect(result).toBe("ok");
  });

  test("should call spamAssassinCheck() and return spam check response", async () => {
    const mockData = { Errors: 0, IsSpam: false, Rules: [], Score: 0 };
    mockFetch.mockResolvedValue(mockJsonResponse(mockData));
    const result = await client.spamAssassinCheck();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8025/api/v1/message/latest/sa-check");
    expect(init.method).toBe("GET");
    expect(result).toEqual(mockData);
  });

  const mockChaosData = {
    Authentication: { ErrorCode: 451, Probability: 5 },
    Recipient: { ErrorCode: 451, Probability: 5 },
    Sender: { ErrorCode: 451, Probability: 5 },
  };

  test("should call getChaosTriggers() and return triggers", async () => {
    mockFetch.mockResolvedValue(mockJsonResponse(mockChaosData));
    const result = await client.getChaosTriggers();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8025/api/v1/chaos");
    expect(init.method).toBe("GET");
    expect(result).toEqual(mockChaosData);
  });

  test("should call setChaosTriggers() and return ok", async () => {
    mockFetch.mockResolvedValue(mockJsonResponse(mockChaosData));
    const result = await client.setChaosTriggers();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8025/api/v1/chaos");
    expect(init.method).toBe("PUT");
    expect(result).toEqual(mockChaosData);
  });

  // Error handling cases
  test("should throw a descriptive error when fetch rejects (network failure)", async () => {
    mockFetch.mockRejectedValue(new TypeError("fetch failed"));
    await expect(client.getInfo()).rejects.toThrow(
      "Mailpit API Error: No response received from server at GET http://localhost:8025/api/v1/info: fetch failed",
    );
  });

  test("should throw a descriptive error when server returns non-200 status with text body", async () => {
    mockFetch.mockResolvedValue(mockTextResponse("Boom!", 500));
    await expect(client.getInfo()).rejects.toThrow(
      'Mailpit API Error: 500 Error at GET http://localhost:8025/api/v1/info: "Boom!"',
    );
  });

  test("should throw a descriptive error when server returns non-200 status with JSON body", async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ error: "not found" }, 404));
    await expect(client.getInfo()).rejects.toThrow(
      'Mailpit API Error: 404 Error at GET http://localhost:8025/api/v1/info: {"error":"not found"}',
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
    const newClient = new MailpitClient("http://localhost:8025");
    expect(newClient["webSocket"]).toBeNull();
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
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const unsubscribe1 = internalClient.onEvent("new", listener1);
    const unsubscribe2 = internalClient.onEvent("new", listener2);

    expect(internalClient.eventListeners.get("new")?.size).toBe(2);

    unsubscribe1();
    expect(internalClient.eventListeners.get("new")?.size).toBe(1);

    unsubscribe2();
    expect(internalClient.eventListeners.has("new")).toBe(false);
  });

  test("disconnect() should terminate the inner socket for clean process exit", () => {
    const mockTerminate = vi.fn();

    internalClient.connectWebSocket();
    expect(internalClient.webSocket).not.toBeNull();

    const ws = internalClient.webSocket as unknown as Record<string, unknown>;
    ws._ws = { terminate: mockTerminate };

    internalClient.disconnect();

    expect(internalClient.webSocket).toBeNull();
    expect(mockTerminate).toHaveBeenCalled();
  });

  test("connectWebSocket() should unref the underlying socket and timers on open", () => {
    const mockUnref = vi.fn();

    internalClient.connectWebSocket();

    const openHandlers = mockWebSocketHandlers.get("open") ?? [];
    expect(openHandlers.length).toBeGreaterThan(0);

    const ws = internalClient.webSocket as unknown as Record<string, unknown>;
    ws._ws = { _socket: { unref: mockUnref } };
    ws._uptimeTimeout = { unref: mockUnref };
    ws._connectTimeout = { unref: mockUnref };

    openHandlers[0]({} as never);

    expect(mockUnref).toHaveBeenCalledTimes(3);
  });

  test("waitForEvent() should auto-connect when WebSocket is closed", () => {
    const closedWebSocket = {
      readyState: ReconnectingWebSocket.CLOSED,
    } as unknown as ReconnectingWebSocket;

    internalClient.webSocket = closedWebSocket;

    const promise = internalClient.waitForEvent("new", 100);

    expect(internalClient.webSocket).not.toBe(closedWebSocket);
    expect(internalClient.webSocket).not.toBeNull();

    promise.catch(() => {});
  });

  test("waitForEvent() should timeout and remove listener", async () => {
    const promise = internalClient.waitForEvent("new", 50);

    await expect(promise).rejects.toThrow(
      'Timeout waiting for event of type "new"',
    );

    const listeners = internalClient.eventListeners.get("new");
    expect(listeners?.size || 0).toBe(0);
  });

  test("waitForEvent() should not timeout when passed Infinity", async () => {
    const originalMethod = internalClient.waitForEvent.bind(internalClient);
    const spy = vi.fn((eventType: string, timeout: number = 50) => {
      return originalMethod(eventType, timeout);
    });
    internalClient.waitForEvent = spy;

    const promise = internalClient.waitForEvent("new", Infinity);

    expect(spy).toHaveBeenCalledWith("new", Infinity);

    const listeners = internalClient.eventListeners.get("new");
    expect(listeners?.size).toBe(1);

    // Message arrives at 100ms - longer than the spy's 50ms default,
    // proving Infinity disabled the timeout
    setTimeout(() => {
      internalClient.handleWebSocketMessage({
        Type: "new",
        Data: { ID: "test-123" },
      });
    }, 100);

    const result = await promise;

    expect(result.Type).toBe("new");
    expect(result.Data).toEqual({ ID: "test-123" });
    expect(internalClient.eventListeners.get("new")?.size || 0).toBe(0);
  });

  test("removeListener() should handle removeListener when no listeners exist", () => {
    const removeListener = internalClient.removeListener.bind(internalClient);
    expect(() => {
      removeListener("new", () => {});
    }).not.toThrow();
  });

  test("should silently ignore malformed JSON messages from WebSocket", () => {
    const mockListener = vi.fn();
    client.onEvent("new", mockListener);

    const messageHandlers = mockWebSocketHandlers.get("message") ?? [];
    expect(messageHandlers.length).toBeGreaterThan(0);

    expect(() => {
      messageHandlers[0]({ data: "{ this is not valid json }" } as never);
    }).not.toThrow();

    expect(mockListener).not.toHaveBeenCalled();
  });

  // Mock response for message list polling
  const mockEmptyMessages = {
    messages: [],
    messages_count: 0,
    messages_unread: 0,
    start: 0,
    tags: [],
    total: 0,
    unread: 0,
    count: 0,
  };

  const mockMessagesWithCount = (count: number) => ({
    messages: Array.from({ length: count }, (_, i) => ({
      ID: `msg-${String(i + 1)}`,
      Subject: `Message ${String(i + 1)}`,
    })),
    messages_count: count,
    messages_unread: count,
    start: 0,
    tags: [],
    total: count,
    unread: count,
    count,
  });

  const mockFullMessage = {
    ID: "msg-1",
    Subject: "Test",
    From: { Email: "test@example.test", Name: "Test" },
    To: [{ Email: "recipient@example.test", Name: "Recipient" }],
    HTML: "<p>Hello</p>",
    Text: "Hello",
  };

  test("waitForMessage() should poll until a message appears", async () => {
    mockFetch
      .mockResolvedValueOnce(mockJsonResponse(mockEmptyMessages))
      .mockResolvedValueOnce(mockJsonResponse(mockMessagesWithCount(1)))
      .mockResolvedValueOnce(mockJsonResponse(mockFullMessage));

    const result = await internalClient.waitForMessage({
      query: "subject:Test",
    });

    const calls = mockFetch.mock.calls as [string, RequestInit][];
    expect(calls[0][0]).toContain("/api/v1/search");
    expect(calls[0][0]).toContain("query=subject%3ATest");
    expect(calls[2][0]).toContain("/api/v1/message/msg-1");
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result).toEqual(mockFullMessage);
  });

  test("waitForMessage() should timeout when no messages match", async () => {
    mockFetch.mockResolvedValue(mockJsonResponse(mockEmptyMessages));

    await expect(
      internalClient.waitForMessage(
        { query: "subject:NonExistent" },
        { timeout: 150, interval: 50 },
      ),
    ).rejects.toThrow(
      'Timeout waiting for messages matching query "subject:NonExistent"',
    );
  });

  test("waitForMessages() should use listMessages() by default and resolve when condition met", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse(mockMessagesWithCount(1)));

    const result = await internalClient.waitForMessages();

    expect(result.messages_count).toBe(1);
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/messages");
    expect(url).toContain("start=0");
    expect(url).toContain("limit=50");
  });

  test("waitForMessages() should use searchMessages() when search provided", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse(mockMessagesWithCount(1)));

    await internalClient.waitForMessages(
      { query: "from:test@example.test" },
      { timeout: 1000, interval: 50 },
    );

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/search");
    expect(url).toContain("query=from%3Atest%40example.test");
  });

  test("waitForMessages() with exact: true or count: 0 should require exact count", async () => {
    // exact: true - skips count=3 (too many), resolves on count=2
    mockFetch
      .mockResolvedValueOnce(mockJsonResponse(mockMessagesWithCount(3)))
      .mockResolvedValueOnce(mockJsonResponse(mockMessagesWithCount(2)));

    const exactResult = await internalClient.waitForMessages(
      { count: 2, exact: true },
      { timeout: 1000, interval: 50 },
    );
    expect(exactResult.messages_count).toBe(2);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    vi.clearAllMocks();

    // count: 0 - skips non-empty, resolves when empty
    mockFetch
      .mockResolvedValueOnce(mockJsonResponse(mockMessagesWithCount(1)))
      .mockResolvedValueOnce(mockJsonResponse(mockEmptyMessages));

    const zeroResult = await internalClient.waitForMessages(
      { count: 0 },
      { timeout: 1000, interval: 50 },
    );
    expect(zeroResult.messages_count).toBe(0);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test("waitForMessages() should not timeout when passed Infinity", async () => {
    mockFetch
      .mockResolvedValueOnce(mockJsonResponse(mockEmptyMessages))
      .mockResolvedValueOnce(mockJsonResponse(mockEmptyMessages))
      .mockResolvedValueOnce(mockJsonResponse(mockMessagesWithCount(1)));

    const result = await internalClient.waitForMessages({
      timeout: Infinity,
      interval: 50,
    });

    expect(result.messages_count).toBe(1);
  });

  test("waitForMessages() should timeout with error message including query if provided", async () => {
    mockFetch.mockResolvedValue(mockJsonResponse(mockMessagesWithCount(1)));

    // Without query - generic timeout message
    await expect(
      internalClient.waitForMessages(
        { count: 5 },
        { timeout: 150, interval: 50 },
      ),
    ).rejects.toThrow("Timeout waiting for messages");

    // With query - error message includes the query string
    await expect(
      internalClient.waitForMessages(
        { query: "from:nobody@example.test", count: 5 },
        { timeout: 150, interval: 50 },
      ),
    ).rejects.toThrow(
      'Timeout waiting for messages matching query "from:nobody@example.test"',
    );
  });
});
