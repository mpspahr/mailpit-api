import {
  vi,
  type Mock,
  describe,
  beforeEach,
  afterEach,
  expect,
  test,
} from "vitest";
import ReconnectingWebSocket from "partysocket/ws";
import { MailpitEvents } from "../src/index";

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

describe("MailpitEvents", () => {
  let events: MailpitEvents;
  let internalEvents: {
    connect: () => Promise<void>;
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
    events = new MailpitEvents("http://localhost:8025");
    internalEvents = events as unknown as typeof internalEvents;
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockWebSocketHandlers.clear();
  });

  // Constructor validation tests
  test("should throw error for malformed protocol", () => {
    expect(() => new MailpitEvents("ht!tp://bad-url")).toThrow(
      "The value of the 'baseURL' parameter is not a valid URL",
    );
  });

  test("should throw error for bare protocol string", () => {
    expect(() => new MailpitEvents("http://")).toThrow(
      "The value of the 'baseURL' parameter is not a valid URL",
    );
  });

  test("should throw error for wrong scheme", () => {
    expect(() => new MailpitEvents("ftp://localhost:8025")).toThrow(
      "The value of the 'baseURL' parameter must start with http, https, ws, or wss",
    );
  });

  test("should throw error for baseURL with query parameters", () => {
    expect(() => new MailpitEvents("http://localhost:8025?foo=bar")).toThrow(
      "The value of the 'baseURL' parameter must not contain query parameters or a hash fragment",
    );
  });

  test("should throw error for baseURL with hash fragment", () => {
    expect(() => new MailpitEvents("http://localhost:8025#section")).toThrow(
      "The value of the 'baseURL' parameter must not contain query parameters or a hash fragment",
    );
  });

  test("should not auto-connect WebSocket by default", () => {
    const newEvents = new MailpitEvents("http://localhost:8025");
    expect(
      (newEvents as unknown as typeof internalEvents).webSocket,
    ).toBeNull();
  });

  test("connect() should return early when already connected", async () => {
    const existingWebSocket = {
      readyState: ReconnectingWebSocket.OPEN,
    } as unknown as ReconnectingWebSocket;

    internalEvents.webSocket = existingWebSocket;
    await internalEvents.connect();
    expect(internalEvents.webSocket).toBe(existingWebSocket);
  });

  test("connect() should return a resolved Promise when socket is already open", async () => {
    const existingWebSocket = {
      readyState: ReconnectingWebSocket.OPEN,
    } as unknown as ReconnectingWebSocket;

    internalEvents.webSocket = existingWebSocket;
    const result = internalEvents.connect();
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeUndefined();
  });

  test("connect() should return a pending Promise that resolves when the socket opens", async () => {
    // Mock a CONNECTING socket so connect() returns a pending Promise.
    (ReconnectingWebSocket as unknown as Mock).mockImplementationOnce(function (
      this: Record<string, unknown>,
    ) {
      this.readyState = ReconnectingWebSocket.CONNECTING;
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

    const connectPromise = internalEvents.connect();
    expect(connectPromise).toBeInstanceOf(Promise);

    // Promise should still be pending before the open event fires.
    let resolved = false;
    void connectPromise.then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(false);

    // Fire the open event - all registered open handlers should run.
    const openHandlers = mockWebSocketHandlers.get("open") ?? [];
    expect(openHandlers.length).toBeGreaterThan(0);
    openHandlers.forEach((h) => {
      h({} as never);
    });

    await connectPromise;
    expect(resolved).toBe(true);
  });

  test("connect() should create a new socket when existing socket is CLOSING", () => {
    const closingWebSocket = {
      readyState: ReconnectingWebSocket.CLOSING,
    } as unknown as ReconnectingWebSocket;

    internalEvents.webSocket = closingWebSocket;
    void internalEvents.connect();
    // A new socket should have been created to replace the CLOSING one
    expect(internalEvents.webSocket).not.toBe(closingWebSocket);
    expect(internalEvents.webSocket).not.toBeNull();
  });

  test("connect() should reject when disconnect() is called before the socket opens", async () => {
    // Mock a CONNECTING socket so connect() returns a pending Promise.
    (ReconnectingWebSocket as unknown as Mock).mockImplementationOnce(function (
      this: Record<string, unknown>,
    ) {
      this.readyState = ReconnectingWebSocket.CONNECTING;
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

    const connectPromise = internalEvents.connect();

    // Simulate disconnect() - sets webSocket to null then fires close on the old socket
    internalEvents.webSocket = null;
    const closeHandlers = mockWebSocketHandlers.get("close") ?? [];
    closeHandlers.forEach((h) => {
      h({} as never);
    });

    await expect(connectPromise).rejects.toThrow(
      "WebSocket connection closed before opening",
    );
  });

  test("connect() should not reject when ReconnectingWebSocket fires close during a reconnect cycle", async () => {
    // Mock a CONNECTING socket so connect() returns a pending Promise.
    (ReconnectingWebSocket as unknown as Mock).mockImplementationOnce(function (
      this: Record<string, unknown>,
    ) {
      this.readyState = ReconnectingWebSocket.CONNECTING;
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

    const connectPromise = internalEvents.connect();

    // Simulate a reconnect-cycle close (webSocket is still the same instance - NOT replaced)
    const closeHandlers = mockWebSocketHandlers.get("close") ?? [];
    closeHandlers.forEach((h) => {
      h({} as never);
    });

    // Promise should still be pending - not rejected - because webSocket wasn't replaced
    let rejected = false;
    void connectPromise.catch(() => {
      rejected = true;
    });
    await Promise.resolve();
    expect(rejected).toBe(false);

    // Now fire open - promise should resolve
    const openHandlers = mockWebSocketHandlers.get("open") ?? [];
    openHandlers.forEach((h) => {
      h({} as never);
    });
    await connectPromise;
    expect(rejected).toBe(false);
  });

  test("waitForEvent() should reject if connect() throws", async () => {
    const connectionError = new Error("WebSocket connection refused");
    (ReconnectingWebSocket as unknown as Mock).mockImplementationOnce(
      function () {
        throw connectionError;
      },
    );
    const newEvents = new MailpitEvents("http://localhost:8025");
    await expect(newEvents.waitForEvent("new")).rejects.toThrow(
      "WebSocket connection refused",
    );
  });

  test("disconnect() should do nothing when no WebSocket exists", () => {
    internalEvents.webSocket = null;
    internalEvents.disconnect();
    expect(internalEvents.webSocket).toBeNull();
  });

  test("onEvent() should return unsubscribe function that removes listener", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const unsubscribe1 = internalEvents.onEvent("new", listener1);
    const unsubscribe2 = internalEvents.onEvent("new", listener2);

    expect(internalEvents.eventListeners.get("new")?.size).toBe(2);

    unsubscribe1();
    expect(internalEvents.eventListeners.get("new")?.size).toBe(1);

    unsubscribe2();
    expect(internalEvents.eventListeners.has("new")).toBe(false);
  });

  test("disconnect() should terminate the inner socket for clean process exit", () => {
    const mockTerminate = vi.fn();

    void internalEvents.connect();
    expect(internalEvents.webSocket).not.toBeNull();

    const ws = internalEvents.webSocket as unknown as Record<string, unknown>;
    ws._ws = { terminate: mockTerminate };

    internalEvents.disconnect();

    expect(internalEvents.webSocket).toBeNull();
    expect(mockTerminate).toHaveBeenCalled();
  });

  test("connect() should unref the underlying socket and timers on open", () => {
    const mockUnref = vi.fn();

    void internalEvents.connect();

    const openHandlers = mockWebSocketHandlers.get("open") ?? [];
    expect(openHandlers.length).toBeGreaterThan(0);

    const ws = internalEvents.webSocket as unknown as Record<string, unknown>;
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

    internalEvents.webSocket = closedWebSocket;

    const promise = internalEvents.waitForEvent("new", 100);

    expect(internalEvents.webSocket).not.toBe(closedWebSocket);
    expect(internalEvents.webSocket).not.toBeNull();

    promise.catch(() => {});
  });

  test("waitForEvent() should timeout and remove listener", async () => {
    const promise = internalEvents.waitForEvent("new", 50);

    await expect(promise).rejects.toThrow(
      'Timeout waiting for event of type "new"',
    );

    const listeners = internalEvents.eventListeners.get("new");
    expect(listeners?.size || 0).toBe(0);
  });

  test("waitForEvent() should not timeout when passed Infinity", async () => {
    const originalMethod = internalEvents.waitForEvent.bind(internalEvents);
    const spy = vi.fn((eventType: string, timeout: number = 50) => {
      return originalMethod(eventType, timeout);
    });
    internalEvents.waitForEvent = spy;

    const promise = internalEvents.waitForEvent("new", Infinity);

    expect(spy).toHaveBeenCalledWith("new", Infinity);

    const listeners = internalEvents.eventListeners.get("new");
    expect(listeners?.size).toBe(1);

    // Message arrives at 100ms - longer than the spy's 50ms default,
    // proving Infinity disabled the timeout
    setTimeout(() => {
      internalEvents.handleWebSocketMessage({
        Type: "new",
        Data: { ID: "test-123" },
      });
    }, 100);

    const result = await promise;

    expect(result.Type).toBe("new");
    expect(result.Data).toEqual({ ID: "test-123" });
    expect(internalEvents.eventListeners.get("new")?.size || 0).toBe(0);
  });

  test("removeListener() should handle removeListener when no listeners exist", () => {
    const removeListener = internalEvents.removeListener.bind(internalEvents);
    expect(() => {
      removeListener("new", () => {});
    }).not.toThrow();
  });

  test("should silently ignore malformed JSON messages from WebSocket", () => {
    const mockListener = vi.fn();
    events.onEvent("new", mockListener);

    const messageHandlers = mockWebSocketHandlers.get("message") ?? [];
    expect(messageHandlers.length).toBeGreaterThan(0);

    expect(() => {
      messageHandlers[0]({ data: "{ this is not valid json }" } as never);
    }).not.toThrow();

    expect(mockListener).not.toHaveBeenCalled();
  });
});
