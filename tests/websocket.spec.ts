import { jest, describe, beforeEach, expect, test } from "@jest/globals";
import axios, { AxiosInstance } from "axios";
import { MailpitClient, MailpitWebSocketOptions } from "../src/index";

jest.mock("axios");

// Mock WebSocket
class MockWebSocket {
  readyState = 0; // CONNECTING
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;

  constructor(
    public url: string,
    public options?: { headers?: unknown },
  ) {
    // Simulate async connection
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();
    }, 10);
  }

  close(code?: number) {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ code: code || 1000 });
  }

  // Helper to simulate receiving a message
  simulateMessage(data: string) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
}

// Replace the WebSocket in the module
let mockWS: typeof MockWebSocket;
jest.mock("ws", () => MockWebSocket);

describe("MailpitClient WebSocket", () => {
  let mockedAxios: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockedAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      defaults: {
        baseURL: "http://localhost:8025",
      },
    } as unknown as jest.Mocked<AxiosInstance>;

    (axios.create as jest.Mock).mockReturnValue(mockedAxios);
    mockWS = MockWebSocket;
  });

  test("should not auto-connect WebSocket by default", () => {
    const client = new MailpitClient("http://localhost:8025");
    expect(client.webSocket).toBeNull();
  });

  test("should auto-connect WebSocket when autoConnect is true", async () => {
    const options: MailpitWebSocketOptions = { autoConnect: true };
    const client = new MailpitClient(
      "http://localhost:8025",
      undefined,
      options,
    );

    // Wait for connection
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(client.webSocket).not.toBeNull();
    expect(client.webSocket?.readyState).toBe(1); // OPEN
  });

  test("should connect when calling connectWebSocket()", async () => {
    const client = new MailpitClient("http://localhost:8025");
    expect(client.webSocket).toBeNull();

    client.connectWebSocket();

    // Wait for connection
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(client.webSocket).not.toBeNull();
    expect(client.webSocket?.readyState).toBe(1); // OPEN
  });

  test("should apply custom reconnect options", () => {
    const options: MailpitWebSocketOptions = {
      maxReconnectAttempts: 10,
      reconnectDelay: 5000,
    };
    const client = new MailpitClient(
      "http://localhost:8025",
      undefined,
      options,
    );

    // Access private properties via type assertion for testing
    expect((client as any).maxReconnectAttempts).toBe(10);
    expect((client as any).reconnectDelay).toBe(5000);
  });

  test("waitForWebSocketEvent should resolve when event is received", async () => {
    const client = new MailpitClient("http://localhost:8025");
    client.connectWebSocket();

    // Wait for connection
    await new Promise((resolve) => setTimeout(resolve, 20));

    const eventPromise = client.waitForWebSocketEvent("new", 1000);

    // Simulate receiving a message
    setTimeout(() => {
      const ws = client.webSocket as any;
      ws.simulateMessage(
        JSON.stringify({
          Type: "new",
          Data: { ID: "test-123", Subject: "Test" },
        }),
      );
    }, 50);

    const event = await eventPromise;
    expect(event.Type).toBe("new");
    expect(event.Data).toHaveProperty("ID", "test-123");
  });

  test("waitForWebSocketEvent should reject on timeout", async () => {
    const client = new MailpitClient("http://localhost:8025");
    client.connectWebSocket();

    // Wait for connection
    await new Promise((resolve) => setTimeout(resolve, 20));

    await expect(client.waitForWebSocketEvent("new", 100)).rejects.toThrow(
      'Timeout waiting for WebSocket event of type "new"',
    );
  });

  test("should disconnect WebSocket cleanly", async () => {
    const client = new MailpitClient("http://localhost:8025", undefined, {
      autoConnect: true,
    });

    // Wait for connection
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(client.webSocket?.readyState).toBe(1); // OPEN

    client.disconnectWebSocket();

    expect(client.webSocket).toBeNull();
  });
});
