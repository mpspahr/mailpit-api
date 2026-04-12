import ReconnectingWebSocket from "partysocket/ws";
import WS from "isomorphic-ws";
import type {
  MailpitAuthCredentials,
  MailpitMessageListItem,
} from "mailpit-api";

// In browsers, isomorphic-ws re-exports the native WebSocket directly.
// In Node.js it exports the 'ws' package, so the comparison is false.
const IS_NATIVE_WEBSOCKET =
  typeof WebSocket !== "undefined" && (WS as unknown) === WebSocket;

/** @internal UTF-8-safe Base64 encoding that works in both Node.js 18+ and browsers. */
function base64Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

// Re-export shared types from mailpit-api for convenience
export type {
  MailpitAuthCredentials,
  MailpitEmailAddressResponse,
  MailpitMessageListItem,
} from "mailpit-api";

/** Statistics data structure returned in "stats" events */
export interface MailpitStatsData {
  /** Total number of messages in the database */
  Total: number;
  /** Total number of unread messages */
  Unread: number;
  /** Mailpit version */
  Version: string;
}

/** Update data structure returned in "update" events */
export interface MailpitUpdateData {
  /** Message database ID */
  ID: string;
  /** Read status (if changed) */
  Read?: boolean;
  /** Tags (if changed) */
  Tags?: string[];
}

/** Delete data structure returned in "delete" events */
export interface MailpitDeleteData {
  /** Message database ID */
  ID: string;
}

/** Error data structure returned in "error" events */
export interface MailpitErrorData {
  /** Error severity level */
  Level: string;
  /** Error type */
  Type: string;
  /** Client IP address */
  IP: string;
  /** Error message */
  Message: string;
}

/** Event message containing a type and data payload */
export interface MailpitEvent<
  T =
    | MailpitMessageListItem
    | MailpitStatsData
    | MailpitUpdateData
    | MailpitDeleteData
    | MailpitErrorData
    | null,
> {
  /** Type of event being broadcast */
  Type: string;
  /** Event data payload */
  Data: T;
}

/** Event for new messages */
export interface MailpitNewMessageEvent extends MailpitEvent<MailpitMessageListItem> {
  Type: "new";
}

/** Event for statistics updates */
export interface MailpitStatsEvent extends MailpitEvent<MailpitStatsData> {
  Type: "stats";
}

/** Event for message updates */
export interface MailpitUpdateEvent extends MailpitEvent<MailpitUpdateData> {
  Type: "update";
}

/** Event for message deletion */
export interface MailpitDeleteEvent extends MailpitEvent<MailpitDeleteData> {
  Type: "delete";
}

/** Event for database pruning (Data is null) */
export interface MailpitPruneEvent extends MailpitEvent<null> {
  Type: "prune";
}

/** Event for truncating all messages (Data is null) */
export interface MailpitTruncateEvent extends MailpitEvent<null> {
  Type: "truncate";
}

/** Event for client errors (SMTP/POP3 errors) */
export interface MailpitErrorEvent extends MailpitEvent<MailpitErrorData> {
  Type: "error";
}

/** Maps event type strings to their corresponding event interfaces */
export interface MailpitEventMap {
  /** Event for new messages */
  new: MailpitNewMessageEvent;
  /** Event for statistics updates */
  stats: MailpitStatsEvent;
  /** Event for message updates */
  update: MailpitUpdateEvent;
  /** Event for message deletion */
  delete: MailpitDeleteEvent;
  /** Event for database pruning */
  prune: MailpitPruneEvent;
  /** Event for truncating all messages */
  truncate: MailpitTruncateEvent;
  /** Event for client errors (SMTP/POP3 errors) */
  error: MailpitErrorEvent;
  /** Wildcard event type that matches all events */
  "*": MailpitEvent;
}

/** Valid event types including specific event names and the wildcard "*" */
export type MailpitEventType = keyof MailpitEventMap;

/**
 * @internal
 * Internal properties exposed by partysocket's ReconnectingWebSocket and the
 * underlying `ws` WebSocket. Used to prevent the Node.js process from hanging
 * by calling `unref()` on sockets/timers and `terminate()` on disconnect.
 * These properties do not exist on browser WebSocket - all access is guarded
 * with optional chaining so it degrades to a no-op in browsers.
 */
interface ReconnectingWebSocketInternals {
  _ws?: {
    _socket?: { unref?: () => void };
    terminate?: () => void;
  };
  _uptimeTimeout?: { unref?: () => void };
  _connectTimeout?: { unref?: () => void };
}

/**
 * Client for receiving real-time events from the {@link https://mailpit.axllent.org/docs/api-v1/websocket/ | Mailpit WebSocket API}.
 * @example
 * ```typescript
 * import { MailpitEvents } from "mailpit-ws";
 * const events = new MailpitEvents("http://localhost:8025");
 * events.onEvent("new", (event) => {
 *   console.log("New message:", event.Data.Subject);
 * });
 * ```
 */
export class MailpitEvents {
  readonly #authHeader?: string;
  private readonly wsURL: string;
  private webSocket: ReconnectingWebSocket | null = null;
  private eventListeners: Map<string, Set<(event: MailpitEvent) => void>> =
    new Map();

  /**
   * Creates an instance of {@link MailpitEvents}.
   * @param baseURL - The base URL of the Mailpit instance (e.g. `http://localhost:8025`).
   * @param auth - Optional authentication credentials.
   * @param auth.username - The username for basic authentication.
   * @param auth.password - The password for basic authentication.
   * @example No Auth
   * ```typescript
   * const events = new MailpitEvents("http://localhost:8025");
   * ```
   * @example Basic Auth
   * ```typescript
   * const events = new MailpitEvents("http://localhost:8025", {
   *   username: "admin",
   *   password: "supersecret"
   * });
   * ```
   */
  constructor(baseURL: string, auth?: MailpitAuthCredentials) {
    if (!baseURL || !/^(?:http|ws)s?:\/\//.test(baseURL)) {
      throw new Error(
        "The value of the 'baseURL' parameter must start with http, https, ws, or wss",
      );
    }

    this.wsURL = `${baseURL.replace(/^http/, "ws").replace(/\/?\/$/, "")}/api/events`;
    this.#authHeader = auth
      ? `Basic ${base64Encode(`${auth.username}:${auth.password}`)}`
      : undefined;
  }

  /**
   * Connects to the WebSocket endpoint for receiving real-time events.
   * @remarks
   * Called automatically by {@link MailpitEvents.onEvent | onEvent()} and {@link MailpitEvents.waitForEvent | waitForEvent()}.
   * You only need to call this directly if you want to establish the connection before registering listeners.
   */
  public connect(): void {
    // Return if already connected or connecting
    if (
      this.webSocket &&
      (this.webSocket.readyState === ReconnectingWebSocket.OPEN ||
        this.webSocket.readyState === ReconnectingWebSocket.CONNECTING)
    ) {
      return;
    }

    // Only set in Node.js when auth credentials are provided.
    // Browsers cannot set custom WebSocket headers, so we skip the wrapper
    // entirely to avoid passing an options object where the native WebSocket
    // constructor expects only an optional protocols string/array.
    const wsOptions: WS.ClientOptions | undefined =
      !IS_NATIVE_WEBSOCKET && this.#authHeader
        ? {
            headers: {
              Authorization: this.#authHeader,
            },
          }
        : undefined;

    const wsConstructor = wsOptions
      ? class AuthenticatedWebSocket extends WS {
          constructor(address: string, options?: WS.ClientOptions) {
            super(address, { ...wsOptions, ...options });
          }
        }
      : WS;

    this.webSocket = new ReconnectingWebSocket(this.wsURL, undefined, {
      WebSocket: wsConstructor,
    });

    this.webSocket.addEventListener("message", (event) => {
      let message: MailpitEvent;
      try {
        message = JSON.parse(event.data as string) as MailpitEvent;
      } catch {
        // Silently ignore malformed messages from server
        return;
      }
      this.handleWebSocketMessage(message);
    });

    // Unref the underlying TCP socket and internal timers so the WebSocket
    // does not prevent the Node.js process from exiting naturally. Called on
    // every "open" event to cover both initial connections and reconnections.
    this.webSocket.addEventListener("open", () => {
      const rws = this.webSocket as unknown as ReconnectingWebSocketInternals;
      rws._ws?._socket?.unref?.();
      rws._uptimeTimeout?.unref?.();
      rws._connectTimeout?.unref?.();
    });
  }

  /**
   * @internal
   * Adds a listener to the event listeners map.
   * @param eventType - The type of event to listen for
   * @param listener - The listener function to add
   */
  private addListener(
    eventType: string,
    listener: (event: MailpitEvent) => void,
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)?.add(listener);
  }

  /**
   * @internal
   * Removes a listener from the event listeners map.
   * @param eventType - The type of event to remove the listener from
   * @param listener - The listener function to remove
   */
  private removeListener(
    eventType: string,
    listener: (event: MailpitEvent) => void,
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  /**
   * @internal
   * Dispatches a message to listeners of a specific event type.
   * @param eventType - The event type to dispatch to
   * @param message - The event message
   */
  private dispatchToListeners(eventType: string, message: MailpitEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach((listener) => {
        listener(message);
      });
    }
  }

  /**
   * @internal
   * Handles incoming WebSocket messages and dispatches them to registered listeners.
   * @param message - The event message
   */
  private handleWebSocketMessage(message: MailpitEvent): void {
    this.dispatchToListeners(message.Type, message);
    this.dispatchToListeners("*", message);
  }

  /**
   * Disconnects from the real-time event stream.
   * @example
   * ```typescript
   * events.disconnect();
   * ```
   */
  public disconnect(): void {
    if (this.webSocket) {
      const ws = this.webSocket;
      this.webSocket = null;
      // Close with code 1000 (normal closure) to prevent reconnection
      ws.close(1000, "Client disconnect");
      // Terminate the inner socket to release the TCP handle immediately,
      // preventing the process from hanging during the close handshake.
      (ws as unknown as ReconnectingWebSocketInternals)._ws?.terminate?.();
    }
  }

  /**
   * Registers a listener for real-time events of a specific type.
   * @remarks
   * Automatically connects to the event stream if not already connected.
   *
   * **Browser only WebSocket limitation:** The connection will fail if Mailpit requires authentication and no other mechanism
   * (e.g. a reverse proxy that injects credentials, or cached browser credentials from a prior UI login) is in place.
   * This limitation does **NOT** affect Node.js. In Node, auth headers are sent correctly for both HTTP and WebSocket connections.
   * @param eventType - The type of event to listen for.
   * Specific event types include: "new" (new messages), "stats", "update", "delete", "prune", "truncate", and "error".
   * Use "*" to listen for all event types (Useful if processing all events uniformly (e.g., logging, debugging, metrics)).
   * @param listener - The callback function to invoke when an event is received
   * @returns A function to unregister the listener
   * @example Listen for event type "new" messages (recommended)
   * ```typescript
   * const unsubscribe = events.onEvent("new", (event) => {
   *   // event.Data is typed as MailpitMessageListItem with full type safety
   *   console.log("New message:", event.Data.Subject);
   * });
   *
   * // Other code...
   *
   * // Unsubscribe listener when no longer needed
   * unsubscribe();
   * ```
   * @example Listen for all events uniformly (for logging/debugging)
   * ```typescript
   * const unsubscribe = events.onEvent("*", (event) => {
   *   // Generic processing for all event types
   *   console.log(`Event ${event.Type} received`);
   * });
   *
   * // Other code...
   *
   * // Unsubscribe listener when no longer needed
   * unsubscribe();
   * ```
   */
  public onEvent<T extends keyof MailpitEventMap>(
    eventType: T,
    listener: (event: MailpitEventMap[T]) => void,
  ): () => void {
    if (
      !this.webSocket ||
      this.webSocket.readyState === ReconnectingWebSocket.CLOSED
    ) {
      this.connect();
    }

    this.addListener(eventType, listener as (event: MailpitEvent) => void);

    // Return function to unregister the listener
    return () => {
      this.removeListener(eventType, listener as (event: MailpitEvent) => void);
    };
  }

  /**
   * Waits for the next event of a specific type.
   * @remarks
   * Automatically connects to the event stream if not already connected.
   * Primarily intended for testing scenarios where you need to wait for a single specific event.
   * The promise will reject if the timeout is reached before an event is received.
   *
   * **Browser only WebSocket limitation:** The connection will fail if Mailpit requires authentication and no other mechanism
   * (e.g. a reverse proxy that injects credentials, or cached browser credentials from a prior UI login) is in place.
   * This limitation does **NOT** affect Node.js. In Node, auth headers are sent correctly for both HTTP and WebSocket connections.
   * @param eventType - The type of event to wait for.
   * Specific event types include: "new" (new messages), "stats", "update", "delete", "prune", "truncate", and "error".
   * @param timeout - Timeout in milliseconds (default: 5000ms). Pass `Infinity` to disable timeout.
   * @returns A promise that resolves with the event when received, or rejects on timeout
   * @example Basic usage
   * ```typescript
   * // Create the promise before triggering the event
   * const eventPromise = events.waitForEvent("new");
   *
   * // Do something that triggers an email to send
   * await mailpit.sendMessage({
   *   From: { Email: "test@example.test" },
   *   To: [{ Email: "recipient@example.test" }],
   *   Subject: "Test",
   * });
   *
   * // Wait for the event confirming the message was received
   * const event = await eventPromise;
   * // event.Data is fully typed as MailpitMessageListItem
   * console.log("Message received:", event.Data.Subject);
   * ```
   */
  public waitForEvent<T extends Exclude<keyof MailpitEventMap, "*">>(
    eventType: T,
    timeout: number = 5_000,
  ): Promise<MailpitEventMap[T]> {
    try {
      if (
        !this.webSocket ||
        this.webSocket.readyState === ReconnectingWebSocket.CLOSED
      ) {
        this.connect();
      }
    } catch (error) {
      return Promise.reject(error as Error);
    }

    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timer) {
          clearTimeout(timer);
        }
        this.removeListener(eventType, listener);
      };

      const listener = (event: MailpitEvent) => {
        cleanup();
        resolve(event as MailpitEventMap[T]);
      };

      this.addListener(eventType, listener);

      if (isFinite(timeout)) {
        timer = setTimeout(() => {
          cleanup();
          reject(new Error(`Timeout waiting for event of type "${eventType}"`));
        }, timeout);
      }
    });
  }
}
