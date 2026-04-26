import {
  vi,
  describe,
  beforeEach,
  afterEach,
  expect,
  test,
  type Mock,
} from "vitest";
import { MailpitClient } from "../src/index";

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

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    client = new MailpitClient("http://localhost:8025");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
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
      "Mailpit API Error: 500 Error at GET http://localhost:8025/api/v1/info: Boom!",
    );
  });

  test("should throw a descriptive error when server returns non-200 status with JSON body", async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ error: "not found" }, 404));
    await expect(client.getInfo()).rejects.toThrow(
      'Mailpit API Error: 404 Error at GET http://localhost:8025/api/v1/info: {"error":"not found"}',
    );
  });

  test("should throw a descriptive error when response body parsing fails", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
      text: () => Promise.reject(new Error("stream error")),
      blob: () => Promise.reject(new Error("stream error")),
      headers: new Headers(),
    } as unknown as Response);
    await expect(client.getInfo()).rejects.toThrow(
      "Mailpit API Error: SyntaxError: Unexpected token at GET http://localhost:8025/api/v1/info",
    );
  });

  // Constructor validation tests
  test("should throw error for malformed protocol", () => {
    expect(() => new MailpitClient("ht!tp://bad-url")).toThrow(
      "The value of the 'baseURL' parameter is not a valid URL",
    );
  });

  test("should throw error for bare protocol string", () => {
    expect(() => new MailpitClient("http://")).toThrow(
      "The value of the 'baseURL' parameter is not a valid URL",
    );
  });

  test("should throw error for wrong scheme", () => {
    expect(() => new MailpitClient("ftp://localhost:8025")).toThrow(
      "The value of the 'baseURL' parameter must start with http:// or https://",
    );
  });

  test("should throw error for baseURL with query parameters", () => {
    expect(() => new MailpitClient("http://localhost:8025?foo=bar")).toThrow(
      "The value of the 'baseURL' parameter must not contain query parameters or a hash fragment",
    );
  });

  test("should throw error for baseURL with hash fragment", () => {
    expect(() => new MailpitClient("http://localhost:8025#section")).toThrow(
      "The value of the 'baseURL' parameter must not contain query parameters or a hash fragment",
    );
  });

  test("should pass fetchOptions to every request", async () => {
    const controller = new AbortController();
    const clientWithOptions = new MailpitClient("http://localhost:8025", {
      fetchOptions: { signal: controller.signal, cache: "no-store" },
    });
    mockFetch.mockResolvedValue(mockJsonResponse({ Version: "1.0" }));
    await clientWithOptions.getInfo();
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
    expect(init.cache).toBe("no-store");
  });

  test("should apply both auth and fetchOptions together", async () => {
    const controller = new AbortController();
    const clientWithOptions = new MailpitClient("http://localhost:8025", {
      auth: { username: "u", password: "p" },
      fetchOptions: { signal: controller.signal, cache: "no-store" },
    });
    mockFetch.mockResolvedValue(mockTextResponse("ok"));
    await clientWithOptions.setReadStatus();
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get("Authorization")).toMatch(/^Basic /);
    expect(init.signal).toBe(controller.signal);
    expect(init.cache).toBe("no-store");
  });

  test("should not allow fetchOptions to override method or headers", async () => {
    const clientWithOptions = new MailpitClient("http://localhost:8025", {
      auth: { username: "u", password: "p" },
      fetchOptions: {
        method: "GET",
        headers: { Authorization: "Bearer fake-token" },
      } as RequestInit,
    });
    mockFetch.mockResolvedValue(mockTextResponse("ok"));
    await clientWithOptions.setReadStatus();
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("PUT");
    expect((init.headers as Headers).get("Authorization")).toMatch(/^Basic /);
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

    const result = await client.waitForMessage({
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
      client.waitForMessage(
        { query: "subject:NonExistent" },
        { timeout: 150, interval: 50 },
      ),
    ).rejects.toThrow(
      'Timeout waiting for messages matching query "subject:NonExistent"',
    );
  });

  test("waitForMessages() should use listMessages() by default and resolve when condition met", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse(mockMessagesWithCount(1)));

    const result = await client.waitForMessages();

    expect(result.messages_count).toBe(1);
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/messages");
    expect(url).toContain("start=0");
    expect(url).toContain("limit=50");
  });

  test("waitForMessages() should use searchMessages() when search provided", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse(mockMessagesWithCount(1)));

    await client.waitForMessages(
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

    const exactResult = await client.waitForMessages(
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

    const zeroResult = await client.waitForMessages(
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

    const result = await client.waitForMessages({
      timeout: Infinity,
      interval: 50,
    });

    expect(result.messages_count).toBe(1);
  });

  test("waitForMessages() should timeout with error message including query if provided", async () => {
    mockFetch.mockResolvedValue(mockJsonResponse(mockMessagesWithCount(1)));

    // Without query - generic timeout message
    await expect(
      client.waitForMessages({ count: 5 }, { timeout: 150, interval: 50 }),
    ).rejects.toThrow("Timeout waiting for messages");

    // With query - error message includes the query string
    await expect(
      client.waitForMessages(
        { query: "from:nobody@example.test", count: 5 },
        { timeout: 150, interval: 50 },
      ),
    ).rejects.toThrow(
      'Timeout waiting for messages matching query "from:nobody@example.test"',
    );
  });
});
