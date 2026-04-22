/** @internal UTF-8-safe Base64 encoding that works in both Node.js 18+ and browsers. */
function base64Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

// COMMON TYPES
/** Credentials for HTTP basic authentication. */
export interface MailpitAuthCredentials {
  /** The username for basic authentication. */
  username: string;
  /** The password for basic authentication. */
  password: string;
}

/**
 * Configuration for a {@link MailpitClient} instance.
 * @experimental Exported for future use by related packages (e.g., a standalone WebSocket module).
 */
export interface MailpitClientConfig {
  /** The base URL of the Mailpit API (must start with http:// or https://). */
  baseURL: string;
  /** Optional basic auth credentials for API and WebSocket connections. */
  auth?: MailpitAuthCredentials;
  /** Optional fetch options merged into every request (e.g. `signal`, `cache`, `keepalive`, `dispatcher`, `headers`). `method` and `body` are managed internally and cannot be overridden. Any `headers` provided here will be merged with internally managed headers (`Authorization`, `Content-Type`), with internal headers taking precedence. */
  fetchOptions?: Omit<RequestInit, "method" | "body">;
}

/** Represents a name and email address for a request. */
export interface MailpitEmailAddressRequest {
  /** Email address */
  Email: string;
  /** Optional name associated with the email address */
  Name?: string;
}

/** Represents a name and email address from a response. */
export interface MailpitEmailAddressResponse {
  /** Email address */
  Address: string;
  /** Name associated with the email address */
  Name: string;
}

/** Represents an attachment for a request. */
export interface MailpitAttachmentRequest {
  /** Base64-encoded string for the file content */
  Content: string;
  /** Optional Content-ID (cid) for attachment. If this field is set then the file is attached inline. */
  ContentID?: string;
  /** Optional Content Type for the the attachment. If this field is not set (or empty) then the content type is automatically detected. */
  ContentType?: string;
  /** Filename for the attachement */
  Filename: string;
}

/** Represents an attachment from a response. */
export interface MailpitAttachmentResponse {
  /** Content ID */
  ContentID: string;
  /** Content type */
  ContentType: string;
  /** File name */
  FileName: string;
  /** Attachment part ID */
  PartID: string;
  /** Size in bytes */
  Size: number;
  /** Checksums for the attachment */
  Checksums: {
    /** MD5 checksum */
    MD5: string;
    /** SHA1 checksum */
    SHA1: string;
    /** SHA256 checksum */
    SHA256: string;
  };
}

/** Represents information about a Chaos trigger */
export interface MailpitChaosTrigger {
  /** SMTP error code to return. The value must range from 400 to 599. */
  ErrorCode: number;
  /** Probability (chance) of triggering the error. The value must range from 0 to 100. */
  Probability: number;
}

/** Common request parameters for APIs with a search query */
export interface MailpitSearchRequest extends MailpitTimeZoneRequest {
  /** {@link https://mailpit.axllent.org/docs/usage/search-filters/ | Search query} */
  query: string;
}

/** Common request parameters for APIs with a search query and time zone option */
export interface MailpitTimeZoneRequest {
  /** {@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones | Timezone identifier} used only for `before:` & `after:` searches (eg: "Pacific/Auckland"). */
  tz?: string;
}

/** Common request parameters for APIs requiring a list of message database IDs */
export interface MailpitDatabaseIDsRequest {
  /** Array of message database IDs */
  IDs?: string[];
}

// API RESPONSES AND REQUESTS
/** Response for the {@link MailpitClient.getInfo | getInfo()} API containing information about the Mailpit instance. */
export interface MailpitInfoResponse {
  /** Database path */
  Database: string;
  /** Datacase size in bytes */
  DatabaseSize: number;
  /** Latest Mailpit version */
  LatestVersion: string;
  /** Total number of messages in the database */
  Messages: number;
  /** Runtime statistics */
  RuntimeStats: {
    /** Current memory usage in bytes */
    Memory: number;
    /** Database runtime messages deleted */
    MessagesDeleted: number;
    /** Accepted runtime SMTP messages */
    SMTPAccepted: number;
    /** Total runtime accepted messages size in bytes */
    SMTPAcceptedSize: number;
    /** Ignored runtime SMTP messages (when using --ignore-duplicate-ids) */
    SMTPIgnored: number;
    /** Rejected runtime SMTP messages */
    SMTPRejected: number;
    /** Mailpit server uptime in seconds */
    Uptime: number;
  };
  /** Tag information */
  Tags: {
    /** Tag names and the total messages per tag */
    [key: string]: number;
  };
  /** Total number of messages in the database */
  Unread: number;
  /** Current Mailpit version */
  Version: string;
}

/** Response for the {@link MailpitClient.getConfiguration| getConfiguraton()} API containing configuration for the Mailpit web UI. */
export interface MailpitConfigurationResponse {
  /** Whether Chaos support is enabled at runtime */
  ChaosEnabled: boolean;
  /** Whether messages with duplicate IDs are ignored */
  DuplicatesIgnored: boolean;
  /** Whether the delete button should be hidden */
  HideDeleteAllButton: boolean;
  /** Label to identify this Mailpit instance */
  Label: string;
  MessageRelay: {
    /** Only allow relaying to these recipients (regex) */
    AllowedRecipients: string;
    /** Block relaying to these recipients (regex) */
    BlockedRecipients: string;
    /** Whether message relaying (release) is enabled */
    Enabled: boolean;
    /** Overrides the "From" address for all relayed messages */
    OverrideFrom: string;
    /** Preserve the original Message-IDs when relaying messages */
    PreserveMessageIDs: boolean;
    /** @deprecated Refer to `AllowedRecipients` instead. No longer documented upstream */
    RecipientAllowlist: string;
    /** Enforced Return-Path (if set) for relay bounces */
    ReturnPath: string;
    /** The configured SMTP server address */
    SMTPServer: string;
  };
  /** Whether SpamAssassin is enabled */
  SpamAssassin: boolean;
}

/** Response for the {@link MailpitClient.getMessageSummary| getMessageSummary()} API containing the summary of a message */
export interface MailpitMessageSummaryResponse {
  /** Message Attachmets */
  Attachments: MailpitAttachmentResponse[];
  /** BCC addresses */
  Bcc: MailpitEmailAddressResponse[];
  /** CC addresses */
  Cc: MailpitEmailAddressResponse[];
  /** Message date if set, else date received. In ISO format: 1970-01-01T00:00:00.000Z */
  Date: string;
  /** sender address */
  From: MailpitEmailAddressResponse;
  /** Message body HTML */
  HTML: string;
  /** Database ID */
  ID: string;
  /** Inline message attachements */
  Inline: MailpitAttachmentResponse[];
  /** ListUnsubscribe contains a summary of List-Unsubscribe & List-Unsubscribe-Post headers including validation of the link structure */
  ListUnsubscribe: {
    /** Validation errors (if any) */
    Errors: string;
    /** List-Unsubscrobe header value */
    Header: string;
    /** List-Unsubscribe-Post valie (if set) */
    HeaderPost: string;
    /** Detected links, maximum one email and one HTTP(S) link  */
    Links: string[];
  };
  /** Message ID */
  MessageID: string;
  /** ReplyTo addresses */
  ReplyTo: MailpitEmailAddressResponse[];
  /** Return-Path */
  ReturnPath: string;
  /** Message size in bytes */
  Size: number;
  /** Message subject */
  Subject: string;
  /** Messages tags */
  Tags: string[];
  /** Message body text */
  Text: string;
  /** To addresses */
  To: MailpitEmailAddressResponse[];
  /** Username used for authentication (if provided) with SMTP or the API */
  Username?: string;
}

/** Response for the {@link MailpitClient.listMessages| listMessages()} API containing the summary of multiple messages. */
export interface MailpitMessagesSummaryResponse {
  /** Messages */
  messages: MailpitMessageListItem[];
  /** Total number of messages matching the current query */
  messages_count: number;
  /** Total number of unread messages matching current query */
  messages_unread: number;
  /** Pagination offset */
  start: number;
  /** All current tags */
  tags: string[];
  /** Total number of messages in mailbox */
  total: number;
  /** Total number of unread messages in mailbox */
  unread: number;
  /** @deprecated No longer documented upstream */
  count: number;
}

/** Represents a message item in a list or WebSocket event */
export interface MailpitMessageListItem {
  /** The number of attachments */
  Attachments: number;
  /** BCC addresses */
  Bcc: MailpitEmailAddressResponse[];
  /** CC addresses */
  Cc: MailpitEmailAddressResponse[];
  /** Created time in ISO format: 1970-01-01T00:00:00.000Z */
  Created: string;
  /** Sender address */
  From: MailpitEmailAddressResponse;
  /** Database ID */
  ID: string;
  /** Message ID */
  MessageID: string;
  /** Read status */
  Read: boolean;
  /** Reply-To addresses */
  ReplyTo: MailpitEmailAddressResponse[];
  /** Message size in bytes (total) */
  Size: number;
  /** Message snippet includes up to 250 characters */
  Snippet: string;
  /** Email subject */
  Subject: string;
  /** Message tags */
  Tags: string[];
  /** To addresses */
  To: MailpitEmailAddressResponse[];
  /** Username used for authentication (if provided) with SMTP or the API */
  Username?: string;
}

/** Response for the {@link MailpitClient.getMessageHeaders | getMessageHeaders()} API containing message headers */
export interface MailpitMessageHeadersResponse {
  /** Message headers */
  [key: string]: [string];
}

/** Request parameters for the {@link MailpitClient.sendMessage | sendMessage()} API. */
export interface MailpitSendRequest {
  /** Attachments */
  Attachments?: MailpitAttachmentRequest[];
  /** Bcc recipients email addresses only */
  Bcc?: string[];
  /** CC recipients */
  Cc?: MailpitEmailAddressRequest[];
  /** Sender address */
  From: MailpitEmailAddressRequest;
  /** Message body (HTML) */
  HTML?: string;
  /** Optional message headers */
  Headers?: {
    /** Header in key value */
    [key: string]: string;
  };
  /** Optional Reply-To recipients */
  ReplyTo?: MailpitEmailAddressRequest[];
  /** Email message subject */
  Subject?: string;
  /** Mailpit tags */
  Tags?: string[];
  /** Message body (text) */
  Text?: string;
  /** To recipients */
  To: MailpitEmailAddressRequest[];
}

/** Response for the {@link MailpitClient.sendMessage | sendMessage()} API containing confirmation identifier. */
export interface MailpitSendMessageConfirmationResponse {
  /** Confirmation message ID */
  ID: string;
}

/** Response from the {@link MailpitClient.htmlCheck | htmlCheck()} API containing HTML check results. */
export interface MailpitHTMLCheckResponse {
  /** All platforms tested, mainly for the web UI */
  Platforms: {
    [key: string]: [string];
  };
  /** Total weighted result for all scores */
  Total: {
    /** Total number of HTML nodes detected in message */
    Nodes: number;
    /** Overall percentage partially supported */
    Partial: number;
    /** Overall percentage supported */
    Supported: number;
    /** Total number of tests done */
    Tests: number;
    /** Overall percentage unsupported */
    Unsupported: number;
  };
  /** List of warnings from tests */
  Warnings: {
    /** Category */
    Category: "css" | "html";
    /** Description */
    Description: string;
    /** Keywords */
    Keywords: string;
    /** Notes based on results */
    NotesByNumber: {
      /** Note in key value */
      [key: string]: string;
    };
    /** Test results */
    Results: {
      /** Family eg: Outlook, Mozilla Thunderbird */
      Family: string;
      /** Friendly name of result, combining family, platform & version */
      Name: string;
      /** Note number for partially supported if applicable */
      NoteNumber: string;
      /** Platform eg: ios, android, windows */
      Platform: string;
      /** Support */
      Support: "yes" | "no" | "partial";
      /** Family version eg: 4.7.1, 2019-10, 10.3 */
      Version: string;
    }[];
    /** Score object */
    Score: {
      /** Number of matches in the document */
      Found: number;
      /** Total percentage partially supported */
      Partial: number;
      /** Total percentage supported */
      Supported: number;
      /** Total percentage unsupported */
      Unsupported: number;
    };
    /** Slug identifier */
    Slug: string;
    /** Tags */
    Tags: string[];
    /** Friendly title */
    Title: string;
    /** URL to caniemail.com */
    URL: string;
  }[];
}

/** Response from the {@link MailpitClient.linkCheck | linkCheck()} API containing link check results. */
export interface MailpitLinkCheckResponse {
  /** Total number of errors */
  Errors: number;
  /** Tested links */
  Links: {
    /** HTTP status definition */
    Status: string;
    /** HTTP status code */
    StatusCode: number;
    /** Link URL */
    URL: string;
  }[];
}

/** Response from the {@link MailpitClient.spamAssassinCheck | spamAssassinCheck()} API containing containing SpamAssassin check results. */
export interface MailpitSpamAssassinResponse {
  /** If populated will return an error string */
  Error: string;
  /** Whether the message is spam or not */
  IsSpam: boolean;
  /**
   * Spam rules triggered and their score.
   * @remarks The rules may return `null` if there is an error. Check the `Error` property for details.
   */
  Rules:
    | {
        /** SpamAssassin rule description */
        Description: string;
        /** SpamAssassin rule name */
        Name: string;
        /** Spam rule score */
        Score: number;
      }[]
    | null;
  /** Total spam score based on triggered rules */
  Score: number;
}

/** Request parameters for the {@link MailpitClient.setReadStatus | setReadStatus()} API. */
export interface MailpitReadStatusRequest extends MailpitDatabaseIDsRequest {
  /**
   * Read status
   * @defaultValue false
   */
  Read?: boolean;
  /** {@link https://mailpit.axllent.org/docs/usage/search-filters/ | Search filter} */
  Search?: string;
}

/** Request parameters for the {@link MailpitClient.searchMessages | searchMessages()} API. */
export interface MailpitSearchMessagesRequest extends MailpitSearchRequest {
  /** Pagination offset */
  start?: number;
  /** Limit results */
  limit?: number;
}

/** Options for the {@link MailpitClient.waitForMessage | waitForMessage()} API. */
export interface MailpitWaitForMessageRequest {
  /** Maximum time to wait in milliseconds. Pass `Infinity` to disable timeout. @defaultValue 5000 */
  timeout?: number;
  /** Polling interval in milliseconds. @defaultValue 500 */
  interval?: number;
}

/** Request parameters for the {@link MailpitClient.waitForMessages | waitForMessages()} API. */
export interface MailpitWaitForMessagesRequest {
  /** Optional {@link https://mailpit.axllent.org/docs/usage/search-filters/ | Search query}. If omitted, polls all messages. */
  query?: string;
  /** Pagination offset */
  start?: number;
  /** Limit results */
  limit?: number;
  /** {@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones | Timezone identifier} used only for `before:` & `after:` searches (eg: "Pacific/Auckland"). */
  tz?: string;
  /** Number of messages to wait for. @defaultValue 1 */
  count?: number;
  /** If `true`, require `messages_count === count`. If `false` (default), require `messages_count >= count`. When `count` is `0`, always uses exact match regardless of this option. @defaultValue false */
  exact?: boolean;
}

/** Request parameters for the {@link MailpitClient.setTags | setTags()} API. */
export interface MailpitSetTagsRequest {
  /** Array of message database IDs */
  IDs: string[];
  /** Array of tag names to set */
  Tags?: string[];
}

/** Request parameters for the {@link MailpitClient.setChaosTriggers | setChaosTriggers()} API. */
export interface MailpitChaosTriggersRequest {
  /** Optional Authentication trigger for Chaos */
  Authentication?: MailpitChaosTrigger;
  /** Optional Recipient trigger for Chaos */
  Recipient?: MailpitChaosTrigger;
  /** Optional Sender trigger for Chaos */
  Sender?: MailpitChaosTrigger;
}

/** Response for the {@link MailpitClient.setChaosTriggers | setChaosTriggers()} and {@link MailpitClient.getChaosTriggers | getChaosTriggers()} APIs containing the current chaos triggers. */
export interface MailpitChaosTriggersResponse {
  /** Authentication trigger for Chaos */
  Authentication: MailpitChaosTrigger;
  /** Recipient trigger for Chaos */
  Recipient: MailpitChaosTrigger;
  /** Sender trigger for Chaos */
  Sender: MailpitChaosTrigger;
}

/** @internal Request HTTP methods */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/** @internal Internal options for HTTP requests */
interface RequestOptions {
  // Typed as `object` so named interfaces (e.g. MailpitSearchRequest) are
  // assignable without requiring an explicit index signature.
  params?: object;
  body?: unknown;
  responseType?: "json" | "blob" | "text";
}

/**
 * Client for interacting with the {@link https://mailpit.axllent.org/docs/api-v1/ | Mailpit API}.
 * @example
 * ```typescript
 * import { MailpitClient } from "mailpit-api";
 * const mailpit = new MailpitClient("http://localhost:8025");
 * console.log(await mailpit.getInfo());
 * ```
 */
export class MailpitClient {
  readonly #authHeader?: string;
  readonly #fetchOptions?: Omit<RequestInit, "method" | "body">;
  private readonly baseURL: string;

  /**
   * Creates an instance of {@link MailpitClient}.
   * @param baseURL - The base URL of the Mailpit API.
   * @param options - Optional configuration including auth credentials and fetch options.
   * @param options.auth - Optional basic auth credentials.
   * @param options.fetchOptions - Optional fetch options merged into every request (e.g. `signal`, `cache`, `keepalive`, `dispatcher`, `headers`). `method` and `body` are managed internally. Any `headers` are merged with internal headers, with internal headers taking precedence.
   * @example No Auth
   * ```typescript
   * const mailpit = new MailpitClient("http://localhost:8025");
   * ```
   * @example Basic Auth
   * ```typescript
   * const mailpit = new MailpitClient("http://localhost:8025", {
   *   auth: { username: "admin", password: "supersecret" }
   * });
   * ```
   * @example With custom fetch options
   * ```typescript
   * const controller = new AbortController();
   * const mailpit = new MailpitClient("http://localhost:8025", {
   *   fetchOptions: { signal: controller.signal }
   * });
   * ```
   */
  constructor(
    baseURL: string,
    options?: Pick<MailpitClientConfig, "auth" | "fetchOptions">,
  ) {
    if (!baseURL || !/^https?:\/\/.+/.test(baseURL)) {
      throw new Error(
        "The value of the 'baseURL' parameter must start with http:// or https://",
      );
    }

    const parsedBase = new URL(baseURL);
    if (parsedBase.search || parsedBase.hash) {
      throw new Error(
        "The value of the 'baseURL' parameter must not contain query parameters or a hash fragment",
      );
    }

    this.baseURL = baseURL;
    this.#authHeader = options?.auth
      ? `Basic ${base64Encode(`${options.auth.username}:${options.auth.password}`)}`
      : undefined;
    this.#fetchOptions = options?.fetchOptions;
  }

  /**
   * @internal
   * Thin wrapper around {@link MailpitClient.request} that returns only the response data.
   */
  /**
   * @internal
   * Fetch wrapper. Builds the URL, sets headers, sends the request,
   * validates status === 200, parses the response body, and throws descriptive
   * errors on failure.
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, body, responseType = "json" } = options;
    // Concatenate to preserve any sub-path in baseURL (e.g. http://host/prefix)
    const url = new URL(this.baseURL.replace(/\/+$/, "") + path);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value as string | number | boolean));
        }
      }
    }

    const headers: Record<string, string> = {};
    if (this.#authHeader) {
      headers["Authorization"] = this.#authHeader;
    }
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const urlString = url.toString();

    let response: Response;
    try {
      response = await globalThis.fetch(urlString, {
        ...this.#fetchOptions,
        method,
        headers: {
          ...(this.#fetchOptions?.headers as
            | Record<string, string>
            | undefined),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (error: unknown) {
      // Per the Fetch spec, fetch() only throws TypeError (network or setup failures).
      throw new Error(
        `Mailpit API Error: No response received from server at ${method} ${urlString}: ${(error as Error).message}`,
      );
    }

    if (response.status !== 200) {
      const message = await response.text().catch(() => "");
      throw new Error(
        `Mailpit API Error: ${String(response.status)} ${response.statusText} at ${method} ${urlString}: ${message}`,
      );
    }

    try {
      if (responseType === "blob") {
        return (await response.blob()) as T & Blob;
      } else if (responseType === "text") {
        return (await response.text()) as T & string;
      } else {
        return (await response.json()) as T;
      }
    } catch (error: unknown) {
      throw new Error(
        `Mailpit API Error: ${(error as Error).toString()} at ${method} ${urlString}`,
      );
    }
  }

  /**
   * Retrieves information about the Mailpit instance.
   *
   * @returns Basic runtime information, message totals and latest release version.
   * @example
   * ```typescript
   * const info = await mailpit.getInfo();
   * ```
   */
  public async getInfo(): Promise<MailpitInfoResponse> {
    return await this.request<MailpitInfoResponse>("GET", "/api/v1/info");
  }

  /**
   * Retrieves the configuration of the Mailpit web UI.
   * @remarks Intended for web UI only!
   * @returns Configuration settings
   * @example
   * ```typescript
   * const config = await mailpit.getConfiguration();
   * ```
   */
  public async getConfiguration(): Promise<MailpitConfigurationResponse> {
    return await this.request<MailpitConfigurationResponse>(
      "GET",
      "/api/v1/webui",
    );
  }

  /**
   * Retrieves a summary of a specific message and marks it as read.
   * @param id - The message database ID. Defaults to `latest` to return the latest message.
   * @returns Message summary
   * @example
   * ```typescript
   * const message = await mailpit.getMessageSummary();
   * ```
   */
  public async getMessageSummary(
    id: string = "latest",
  ): Promise<MailpitMessageSummaryResponse> {
    return await this.request<MailpitMessageSummaryResponse>(
      "GET",
      `/api/v1/message/${id}`,
    );
  }

  /**
   * Retrieves the headers of a specific message.
   * @remarks Header keys are returned alphabetically.
   * @param id - The message database ID. Defaults to `latest` to return the latest message.
   * @returns Message headers
   * @example
   * ```typescript
   * const headers = await mailpit.getMessageHeaders();
   * ```
   */
  public async getMessageHeaders(
    id: string = "latest",
  ): Promise<MailpitMessageHeadersResponse> {
    return await this.request<MailpitMessageHeadersResponse>(
      "GET",
      `/api/v1/message/${id}/headers`,
    );
  }

  /**
   * Retrieves a specific attachment from a message.
   * @param id - Message database ID or "latest"
   * @param partID - The attachment part ID
   * @returns The attachment as a `Blob`. Use `blob.type` for the MIME type.
   * @example
   * ```typescript
   * const message = await mailpit.getMessageSummary();
   * if (message.Attachments.length) {
   *   const blob = await mailpit.getMessageAttachment(message.ID, message.Attachments[0].PartID);
   *   console.log(blob.type); // e.g. "application/pdf"
   *   // Browser: const url = URL.createObjectURL(blob);
   *   // Node.js: const buffer = Buffer.from(await blob.arrayBuffer());
   * }
   * ```
   */
  public async getMessageAttachment(id: string, partID: string): Promise<Blob> {
    return this.request<Blob>("GET", `/api/v1/message/${id}/part/${partID}`, {
      responseType: "blob",
    });
  }

  /**
   * Generates a cropped 180x120 JPEG thumbnail of an image attachment from a message.
   * Only image attachments are supported.
   * @remarks
   * If the image is smaller than 180x120 then the image is padded.
   * If the attachment is not an image then a blank image is returned.
   * @param id - Message database ID or "latest"
   * @param partID - The attachment part ID
   * @returns The thumbnail as a `Blob`. Use `blob.type` for the MIME type (always `image/jpeg`).
   * @example
   * ```typescript
   * const message = await mailpit.getMessageSummary();
   * if (message.Attachments.length) {
   *   const blob = await mailpit.getAttachmentThumbnail(message.ID, message.Attachments[0].PartID);
   *   // Browser: const url = URL.createObjectURL(blob);
   *   // Node.js: const buffer = Buffer.from(await blob.arrayBuffer());
   * }
   * ```
   */
  public async getAttachmentThumbnail(
    id: string,
    partID: string,
  ): Promise<Blob> {
    return this.request<Blob>(
      "GET",
      `/api/v1/message/${id}/part/${partID}/thumb`,
      { responseType: "blob" },
    );
  }

  /**
   * Retrieves the full email message source as plain text.
   * @param id - The message database ID. Defaults to `latest` to return the latest message.
   * @returns Plain text message source
   * @example
   * ```typescript
   * const messageSource = await mailpit.getMessageSource();
   * ```
   */
  public async getMessageSource(id: string = "latest"): Promise<string> {
    return await this.request<string>("GET", `/api/v1/message/${id}/raw`, {
      responseType: "text",
    });
  }

  /**
   * Release a message via a pre-configured external SMTP server.
   * @remarks This is only enabled if message relaying has been configured.
   * @param id - The message database ID. Use `latest` to return the latest message.
   * @param relayTo - Array of email addresses to relay the message to
   * @returns Plain text "ok" response
   * @example
   * ```typescript
   * const message = await mailpit.releaseMessage("latest", ["user1@example.test", "user2@example.test"]);
   * ```
   */
  public async releaseMessage(
    id: string,
    relayTo: { To: string[] },
  ): Promise<string> {
    return await this.request<string>("POST", `/api/v1/message/${id}/release`, {
      body: relayTo,
      responseType: "text",
    });
  }

  /**
   * Sends a message
   * @param sendRequest - The request containing the message details.
   * @returns Response containing database message ID
   * @example
   * ```typescript
   * await mailpit.sendMessage(
   *  From: { Email: "user@example.test", Name: "First LastName" },
   *  To: [{ Email: "rec@example.test", Name: "Recipient Name"}, {Email: "another@example.test"}],
   *  Subject: "Test Email",
   * );
   * ```
   */
  public async sendMessage(
    sendRequest: MailpitSendRequest,
  ): Promise<MailpitSendMessageConfirmationResponse> {
    return await this.request<MailpitSendMessageConfirmationResponse>(
      "POST",
      "/api/v1/send",
      { body: sendRequest },
    );
  }

  /**
   * Retrieves a list of message summaries ordered from newest to oldest.
   * @remarks Only contains the number of attachments and a snippet of the message body.
   * @see {@link MailpitClient.getMessageSummary | getMessageSummary()} for more attachment and body details for a specific message.
   * @param start - The pagination offset. Defaults to `0`.
   * @param limit - The number of messages to retrieve. Defaults to `50`.
   * @returns A list of message summaries
   * @example
   * ```typescript
   * const messages = await mailpit.listMessages();
   * ```
   */
  public async listMessages(
    start: number = 0,
    limit: number = 50,
  ): Promise<MailpitMessagesSummaryResponse> {
    return await this.request<MailpitMessagesSummaryResponse>(
      "GET",
      "/api/v1/messages",
      { params: { start, limit } },
    );
  }

  /**
   * Set the read status of messages.
   * @remarks You can optionally provide an array of `IDs` **OR** a `Search` filter. If neither is  set then all messages are updated.
   * @param readStatus - The request containing the message database IDs/search string and the read status.
   * @param readStatus.Read - The read status to set. Defaults to `false`.
   * @param readStatus.IDs - The optional IDs of the messages to update.
   * @param readStatus.Search - The optional search string to filter messages.
   * @param params - Optional parameters for defining the time zone when using the `before:` and `after:` search filters.
   * @see {@link https://mailpit.axllent.org/docs/usage/search-filters/ | Search filters}
   * @returns Plain text "ok" response
   * @example
   * ```typescript
   * // Set all messages as unread
   * await mailpit.setReadStatus();
   *
   * // Set all messages as read
   * await mailpit.setReadStatus({ Read: true });
   *
   * // Set specific messages as read using IDs
   * await mailpit.setReadStatus({ IDs: ["1", "2", "3"], Read: true });
   *
   * // Set specific messages as read using search
   * await mailpit.setReadStatus({ Search: "from:example.test", Read: true });
   *
   * // Set specific messages as read using after: search with time zone
   * await mailpit.setReadStatus({ Search: "after:2025-04-30", Read: true }, { tz: "America/Chicago" });
   * ```
   */
  public async setReadStatus(
    readStatus: MailpitReadStatusRequest = {},
    params?: MailpitTimeZoneRequest,
  ): Promise<string> {
    return await this.request<string>("PUT", "/api/v1/messages", {
      body: readStatus,
      params,
      responseType: "text",
    });
  }

  /**
   * Delete individual or all messages.
   * @remarks If no `IDs` are provided then all messages are deleted.
   * @param deleteRequest - The request containing the message database IDs to delete.
   * @returns Plain text "ok" response
   * @example
   * ```typescript
   * // Delete all messages
   * await mailpit.deleteMessages();
   *
   * // Delete specific messages
   * await mailpit.deleteMessages({ IDs: ["1", "2", "3"] });
   * ```
   */
  public async deleteMessages(
    deleteRequest?: MailpitDatabaseIDsRequest,
  ): Promise<string> {
    return await this.request<string>("DELETE", "/api/v1/messages", {
      body: deleteRequest,
      responseType: "text",
    });
  }

  /**
   * Retrieve messages matching a search, sorted by received date (descending).
   * @see {@link https://mailpit.axllent.org/docs/usage/search-filters/ | Search filters}
   * @remarks Only contains the number of attachments and a snippet of the message body.
   * @see {@link MailpitClient.getMessageSummary | getMessageSummary()} for more attachment and body details for a specific message.
   * @param search - The search request containing the query and optional parameters.
   * @returns A list of message summaries matching the search criteria.
   * @example
   * ```typescript
   * // Search for messages from a the domain example.test
   * const messages = await mailpit.searchMessages({query: "from:example.test"});
   * ```
   */
  public async searchMessages(
    search: MailpitSearchMessagesRequest,
  ): Promise<MailpitMessagesSummaryResponse> {
    return await this.request<MailpitMessagesSummaryResponse>(
      "GET",
      "/api/v1/search",
      { params: search },
    );
  }

  /**
   * Waits for at least one message matching a search query, then returns the latest matching message.
   * @remarks
   * Polls the {@link MailpitClient.searchMessages | searchMessages()} API at a configurable interval until at least one message is found,
   * then retrieves the full message details via {@link MailpitClient.getMessageSummary | getMessageSummary()}.
   * The promise will reject if the timeout is reached before a matching message is found.
   * @see {@link https://mailpit.axllent.org/docs/usage/search-filters/ | Search filters}
   * @param search - The search request containing the query and optional parameters.
   * @param options - Optional timeout and interval settings.
   * @returns The full message summary of the latest matching message.
   * @example
   * ```typescript
   * // Trigger an email, then wait for it
   * await mailpit.sendMessage({
   *   From: { Email: "test@example.test" },
   *   To: [{ Email: "recipient@example.test" }],
   *   Subject: "Welcome",
   * });
   * const message = await mailpit.waitForMessage({ query: "subject:Welcome" });
   * console.log(message.Subject); // "Welcome"
   * ```
   */
  public async waitForMessage(
    search: MailpitSearchMessagesRequest,
    options?: MailpitWaitForMessageRequest,
  ): Promise<MailpitMessageSummaryResponse> {
    const { timeout = 5_000, interval = 500 } = { ...options };
    const endTime = performance.now() + timeout;
    while (performance.now() < endTime) {
      const result = await this.searchMessages(search);
      if (result.messages_count >= 1 && result.messages.length > 0) {
        return this.getMessageSummary(result.messages[0].ID);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(
      `Timeout waiting for messages matching query "${search.query}"`,
    );
  }

  /**
   * Waits for a specific number of messages to exist, optionally matching a search query.
   * @remarks
   * Polls the {@link MailpitClient.searchMessages | searchMessages()} (if search is provided) or
   * {@link MailpitClient.listMessages | listMessages()} API at a configurable interval until the count condition is met.
   * The promise will reject if the timeout is reached before the condition is satisfied.
   *
   * By default, resolves when `messages_count >= count`. Set `exact: true` to require `messages_count === count`.
   * When `count` is `0`, always uses exact match (`messages_count === 0`) regardless of the `exact` option.
   * @see {@link https://mailpit.axllent.org/docs/usage/search-filters/ | Search filters}
   * @param options - Optional timeout and interval settings.
   * @returns The message list response that satisfied the count condition.
   * @example Wait for at least two messages matching a search
   * ```typescript
   * const response = await mailpit.waitForMessages({ query: "to:user@example.test", count: 2 });
   * console.log(response.messages_count); // 2 or more
   * ```
   * @example Wait for exactly three messages matching a search
   * ```typescript
   * const response = await mailpit.waitForMessages({ query: "from:example.test", count: 3, exact: true });
   * console.log(response.messages_count); // 3
   * ```
   * @example Wait for an empty mailbox
   * ```typescript
   * await mailpit.deleteMessages();
   * const response = await mailpit.waitForMessages({ count: 0 });
   * console.log(response.messages_count); // 0
   * ```
   * @example Wait until no messages match a search query
   * ```typescript
   * await mailpit.deleteMessagesBySearch({ query: "from:example.test" });
   * const response = await mailpit.waitForMessages({ query: "from:example.test", count: 0 });
   * console.log(response.messages_count); // 0
   * ```
   * @example Wait for at least one message with a custom timeout and interval only
   * ```typescript
   * const response = await mailpit.waitForMessages({ timeout: 10_000, interval: 1_000 });
   * console.log(response.messages_count); // 1 or more
   * ```
   */
  public async waitForMessages(
    options?: MailpitWaitForMessageRequest,
  ): Promise<MailpitMessagesSummaryResponse>;
  public async waitForMessages(
    request: MailpitWaitForMessagesRequest,
    options?: MailpitWaitForMessageRequest,
  ): Promise<MailpitMessagesSummaryResponse>;
  public async waitForMessages(
    requestOrOptions?:
      | MailpitWaitForMessagesRequest
      | MailpitWaitForMessageRequest,
    options?: MailpitWaitForMessageRequest,
  ): Promise<MailpitMessagesSummaryResponse> {
    const isOptionsOnly =
      !requestOrOptions ||
      "timeout" in requestOrOptions ||
      "interval" in requestOrOptions;
    const request = isOptionsOnly
      ? undefined
      : (requestOrOptions as MailpitWaitForMessagesRequest);
    const opts = isOptionsOnly
      ? (requestOrOptions as MailpitWaitForMessageRequest)
      : options;
    const {
      query,
      start,
      limit,
      tz,
      count = 1,
      exact = false,
    } = { ...request };
    const { timeout = 5_000, interval = 500 } = { ...opts };
    const endTime = performance.now() + timeout;

    const predicate: (r: MailpitMessagesSummaryResponse) => boolean =
      count === 0 || exact
        ? (r) => r.messages_count === count
        : (r) => r.messages_count >= count;

    while (performance.now() < endTime) {
      const result = query
        ? await this.searchMessages({ query, start, limit, tz })
        : await this.listMessages(start, limit);
      if (predicate(result)) return result;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(
      `Timeout waiting for messages${query ? ` matching query "${query}"` : ""}`,
    );
  }

  /**
   * Delete all messages matching a search.
   * @see {@link https://mailpit.axllent.org/docs/usage/search-filters/ | Search filters}
   * @param search - The search request containing the query.
   * @returns Plain text "ok" response
   * @example
   * ```typescript
   * // Delete all messages from the domain example.test
   * await mailpit.deleteMessagesBySearch({query: "from:example.test"});
   * ```
   */
  public async deleteMessagesBySearch(
    search: MailpitSearchRequest,
  ): Promise<string> {
    return await this.request<string>("DELETE", "/api/v1/search", {
      params: search,
      responseType: "text",
    });
  }

  /**
   * Performs an HTML check on a specific message.
   * @param id - The message database ID. Defaults to `latest` to return the latest message.
   * @returns The summary of the message HTML checker
   * @example
   * ```typescript
   * const htmlCheck = await mailpit.htmlCheck();
   * ```
   */
  public async htmlCheck(
    id: string = "latest",
  ): Promise<MailpitHTMLCheckResponse> {
    return await this.request<MailpitHTMLCheckResponse>(
      "GET",
      `/api/v1/message/${id}/html-check`,
    );
  }

  /**
   * Performs a link check on a specific message.
   * @param id - The message database ID. Defaults to `latest` to return the latest message.
   * @param follow - Whether to follow links. Defaults to `false`.
   * @returns The summary of the message Link checker.
   * @example
   * ```typescript
   * const linkCheck = await mailpit.linkCheck();
   * ```
   */
  public async linkCheck(
    id: string = "latest",
    follow: boolean = false,
  ): Promise<MailpitLinkCheckResponse> {
    return await this.request<MailpitLinkCheckResponse>(
      "GET",
      `/api/v1/message/${id}/link-check`,
      { params: { follow } },
    );
  }

  /**
   * Performs a SpamAssassin check (if enabled) on a specific message.
   * @param id - The message database ID. Defaults to `latest` to return the latest message.
   * @returns The SpamAssassin summary (if enabled)
   * @example
   * ```typescript
   * const spamAssassinCheck = await mailpit.spamAssassinCheck();
   * ```
   */
  public async spamAssassinCheck(
    id: string = "latest",
  ): Promise<MailpitSpamAssassinResponse> {
    return await this.request<MailpitSpamAssassinResponse>(
      "GET",
      `/api/v1/message/${id}/sa-check`,
    );
  }

  /**
   * Retrieves a list of all the unique tags.
   * @returns All unique message tags
   * @example
   * ```typescript
   * const tags = await mailpit.getTags();
   * ```
   */
  public async getTags(): Promise<string[]> {
    return await this.request<string[]>("GET", "/api/v1/tags");
  }

  /**
   * Sets and removes tag(s) on message(s). This will overwrite any existing tags for selected message database IDs.
   * @param request - The request containing the message IDs and tags. To remove all tags from a message, pass an empty `Tags` array or exclude `Tags` entirely.
   * @remarks
   * Tags are limited to the following characters: `a-z`, `A-Z`, `0-9`, `-`, `.`, `spaces`, and `_`, and must be a minimum of 1 character.
   * Other characters are silently stripped from the tag.
   * @returns Plain text "ok" response
   * @example
   * ```typescript
   * // Set tags on message(s)
   * await mailpit.setTags({ IDs: ["1", "2", "3"], Tags: ["tag1", "tag2"] });
   * // Remove tags from message(s)
   * await mailpit.setTags({ IDs: ["1", "2", "3"]});
   * ```
   */
  public async setTags(request: MailpitSetTagsRequest): Promise<string> {
    return await this.request<string>("PUT", "/api/v1/tags", {
      body: request,
      responseType: "text",
    });
  }

  /**
   * Renames an existing tag.
   * @param tag - The current name of the tag.
   * @param newTagName - A new name for the tag.
   * @remarks
   * Tags are limited to the following characters: `a-z`, `A-Z`, `0-9`, `-`, `.`, `spaces`, and `_`, and must be a minimum of 1 character.
   * Other characters are silently stripped from the tag.
   * @returns Plain text "ok" response
   * @example
   * ```typescript
   * await mailpit.renameTag("Old Tag Name", "New Tag Name");
   * ```
   */
  public async renameTag(tag: string, newTagName: string): Promise<string> {
    const encodedTag = encodeURIComponent(tag);
    return await this.request<string>("PUT", `/api/v1/tags/${encodedTag}`, {
      body: { Name: newTagName },
      responseType: "text",
    });
  }

  /**
   * Deletes a tag from all messages.
   * @param tag - The name of the tag to delete.
   * @remarks This does NOT delete any messages
   * @returns Plain text "ok" response
   * @example
   * ```typescript
   * await mailpit.deleteTag("Tag 1");
   * ```
   */
  public async deleteTag(tag: string): Promise<string> {
    const encodedTag = encodeURIComponent(tag);
    return await this.request<string>("DELETE", `/api/v1/tags/${encodedTag}`, {
      responseType: "text",
    });
  }

  /**
   * Retrieves the current Chaos triggers configuration (if enabled).
   * @remarks This will return an error if Chaos is not enabled at runtime.
   * @returns The Chaos triggers configuration
   * @example
   * ```typescript
   * const triggers = await mailpit.getChaosTriggers();
   * ```
   */
  public async getChaosTriggers(): Promise<MailpitChaosTriggersResponse> {
    return await this.request<MailpitChaosTriggersResponse>(
      "GET",
      "/api/v1/chaos",
    );
  }

  /**
   * Sets and/or resets the Chaos triggers configuration (if enabled).
   * @param triggers - The request containing the chaos triggers. Omitted triggers will reset to the default `0%` probabibility.
   * @remarks This will return an error if Chaos is not enabled at runtime.
   * @returns The updated Chaos triggers configuration
   *  @example
   * ```typescript
   * // Reset all triggers to `0%` probability
   * const triggers = await mailpit.setChaosTriggers();
   * // Set `Sender` and reset `Authentication` and `Recipient` triggers
   * const triggers = await mailpit.setChaosTriggers({ Sender: { ErrorCode: 451, Probability: 5 } });
   * ```
   */
  public async setChaosTriggers(
    triggers: MailpitChaosTriggersRequest = {},
  ): Promise<MailpitChaosTriggersResponse> {
    return await this.request<MailpitChaosTriggersResponse>(
      "PUT",
      "/api/v1/chaos",
      { body: triggers },
    );
  }

  /**
   * Renders the HTML part of a specific message which can be used for UI integration testing.
   * @remarks
   * Attached inline images are modified to link to the API provided they exist.
   * If the message does not contain an HTML part then a 404 error is returned.
   *
   *
   * @param id - The message database ID. Defaults to `latest` to return the latest message.
   * @param embed - Whether this route is to be embedded in an iframe. Defaults to `undefined`. Set to `1` to embed.
   * The `embed` parameter will add `target="_blank"` and `rel="noreferrer noopener"` to all links.
   * In addition, a small script will be added to the end of the document to post (postMessage()) the height of the document back to the parent window for optional iframe height resizing.
   * Note that this will also transform the message into a full HTML document (if it isn't already), so this option is useful for viewing but not programmatic testing.
   * @returns Rendered HTML
   * @example
   * ```typescript
   * const html = await mailpit.renderMessageHTML();
   * ```
   */
  public async renderMessageHTML(
    id: string = "latest",
    embed?: 1,
  ): Promise<string> {
    return await this.request<string>("GET", `/view/${id}.html`, {
      params: { embed },
      responseType: "text",
    });
  }

  /**
   * Renders just the message's text part which can be used for UI integration testing.
   * @param id - The message database ID. Defaults to `latest` to return the latest message.
   * @returns Plain text
   * @example
   * ```typescript
   * const html = await mailpit.renderMessageText();
   * ```
   */
  public async renderMessageText(id: string = "latest"): Promise<string> {
    return await this.request<string>("GET", `/view/${id}.txt`, {
      responseType: "text",
    });
  }
}
