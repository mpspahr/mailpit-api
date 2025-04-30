import axios, {
  type AxiosInstance,
  type AxiosResponse,
  isAxiosError,
} from "axios";

// COMMON TYPES
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
  Inline: MailpitEmailAddressResponse[];
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
}

/** Response for the {@link MailpitClient.listMessages| listMessages()} API containing the summary of multiple messages. */
export interface MailpitMessagesSummaryResponse {
  /** Messages */
  messages: {
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
  }[];
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
  Errors: number;
  /** Whether the message is spam or not */
  IsSpam: boolean;
  /** Spam rules triggered */
  Rules: {
    /** SpamAssassin rule description */
    Description: string;
    /** SpamAssassin rule name */
    Name: string;
    /** Spam rule score */
    Score: number;
  }[];
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

/** Response for the {@link MailpitClient.getMessageAttachment |getMessageAttachment()} and {@link MailpitClient.getAttachmentThumbnail | getAttachmentThumbnail()} APIs containing attachment data */
export interface MailpitAttachmentDataResponse {
  /** The attachment binary data */
  data: ArrayBuffer;
  /** The attachment MIME type */
  contentType: string;
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
  private axiosInstance: AxiosInstance;

  /**
   * Creates an instance of {@link MailpitClient}.
   * @param baseURL - The base URL of the Mailpit API.
   * @param auth - Optional authentication credentials.
   * @param auth.username - The username for basic authentication.
   * @param auth.password - The password for basic authentication.
   * @example No Auth
   * ```typescript
   * const mailpit = new MailpitClient("http://localhost:8025");
   * ```
   * @example Basic Auth
   * ```typescript
   * const mailpit = new MailpitClient("http://localhost:8025", {
   *  username: "admin",
   *  password: "supersecret",
   * });
   * ```
   */
  constructor(baseURL: string, auth?: { username: string; password: string }) {
    this.axiosInstance = axios.create({
      baseURL,
      auth,
      validateStatus: function (status) {
        return status === 200;
      },
    });
  }

  /**
   * @internal
   * Handles API requests and errors.
   * @param request - The request function to be executed.
   * @param options - Optional options for the request.
   * @returns A promise that resolves to the response data or the full response object.
   */
  private async handleRequest<T>(
    request: () => Promise<AxiosResponse<T>>,
    options: { fullResponse: true },
  ): Promise<AxiosResponse<T>>;
  private async handleRequest<T>(
    request: () => Promise<AxiosResponse<T>>,
    options?: { fullResponse?: false },
  ): Promise<T>;
  private async handleRequest<T>(
    request: () => Promise<AxiosResponse<T>>,
    options: { fullResponse?: boolean } = { fullResponse: false },
  ): Promise<T | AxiosResponse<T>> {
    try {
      const response = await request();
      return options.fullResponse ? response : response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const url = error.config?.url || "UNKNOWN URL";
        const method = error.config?.method?.toUpperCase() || "UNKNOWN METHOD";
        if (error.response) {
          // Server responded with a status other than 2xx
          throw new Error(
            `Mailpit API Error: ${error.response.status.toString()} ${error.response.statusText} at ${method} ${url}: ${JSON.stringify(error.response.data)}`,
          );
        } else if (error.request) {
          // Request was made but no response was received
          throw new Error(
            `Mailpit API Error: No response received from server at ${method} ${url}`,
          );
        } else {
          // Something happened in setting up the request
          throw new Error(
            `Mailpit API Error: ${(error as Error).toString()} at ${method} ${url}`,
          );
        }
      } else {
        throw new Error(`Unexpected Error: ${error as Error}`);
      }
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitInfoResponse>("/api/v1/info"),
    );
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitConfigurationResponse>("/api/v1/webui"),
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitMessageSummaryResponse>(
        `/api/v1/message/${id}`,
      ),
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitMessageHeadersResponse>(
        `/api/v1/message/${id}/headers`,
      ),
    );
  }

  /**
   * Retrieves a specific attachment from a message.
   * @param id - Message database ID or "latest"
   * @param partID - The attachment part ID
   * @returns Attachment as binary data and the content type
   * @example
   * ```typescript
   * const message = await mailpit.getMessageSummary();
   * if (message.Attachments.length) {
   *  const attachment = await mailpit.getMessageAttachment(message.ID, message.Attachments[0].PartID);
   *  // Do something with the attachment data
   * }
   * ```
   */
  public async getMessageAttachment(
    id: string,
    partID: string,
  ): Promise<MailpitAttachmentDataResponse> {
    const response = await this.handleRequest(
      () =>
        this.axiosInstance.get<ArrayBuffer>(
          `/api/v1/message/${id}/part/${partID}`,
          { responseType: "arraybuffer" },
        ),
      { fullResponse: true },
    );
    return {
      data: response.data,
      contentType: response.headers["content-type"] as string,
    };
  }

  /**
   * Generates a cropped 180x120 JPEG thumbnail of an image attachment from a message.
   * Only image attachments are supported.
   * @remarks
   * If the image is smaller than 180x120 then the image is padded.
   * If the attachment is not an image then a blank image is returned.
   * @param id - Message database ID or "latest"
   * @param partID - The attachment part ID
   * @returns Image attachment thumbnail as binary data and the content type
   * @example
   * ```typescript
   * const message = await mailpit.getMessageSummary();
   * if (message.Attachments.length) {
   *  const thumbnail = await mailpit.getAttachmentThumbnail(message.ID, message.Attachments[0].PartID);
   *  // Do something with the thumbnail data
   * }
   * ```
   */
  public async getAttachmentThumbnail(
    id: string,
    partID: string,
  ): Promise<MailpitAttachmentDataResponse> {
    const response = await this.handleRequest(
      () =>
        this.axiosInstance.get<ArrayBuffer>(
          `/api/v1/message/${id}/part/${partID}/thumb`,
          {
            responseType: "arraybuffer",
          },
        ),
      { fullResponse: true },
    );
    return {
      data: response.data,
      contentType: response.headers["content-type"] as string,
    };
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<string>(`/api/v1/message/${id}/raw`),
    );
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
    return await this.handleRequest(() =>
      this.axiosInstance.post<string>(`/api/v1/message/${id}/release`, relayTo),
    );
  }

  /**
   * Sends a message
   * @param sendReqest - The request containing the message details.
   * @returns Response containing database messsage ID
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
    sendReqest: MailpitSendRequest,
  ): Promise<MailpitSendMessageConfirmationResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.post<MailpitSendMessageConfirmationResponse>(
        `/api/v1/send`,
        sendReqest,
      ),
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
   * const messages = await.listMessages();
   * ```
   */
  public async listMessages(
    start: number = 0,
    limit: number = 50,
  ): Promise<MailpitMessagesSummaryResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitMessagesSummaryResponse>(
        `/api/v1/messages`,
        { params: { start, limit } },
      ),
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
    readStatus: MailpitReadStatusRequest,
    params?: MailpitTimeZoneRequest,
  ): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.put<string>(`/api/v1/messages`, readStatus, {
        params,
      }),
    );
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
    return await this.handleRequest(() =>
      this.axiosInstance.delete<string>(`/api/v1/messages`, {
        data: deleteRequest,
      }),
    );
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitMessagesSummaryResponse>(`/api/v1/search`, {
        params: search,
      }),
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
    return await this.handleRequest(() =>
      this.axiosInstance.delete<string>(`/api/v1/search`, { params: search }),
    );
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitHTMLCheckResponse>(
        `/api/v1/message/${id}/html-check`,
      ),
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
    follow: "true" | "false" = "false",
  ): Promise<MailpitLinkCheckResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitLinkCheckResponse>(
        `/api/v1/message/${id}/link-check`,
        { params: { follow } },
      ),
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitSpamAssassinResponse>(
        `/api/v1/message/${id}/sa-check`,
      ),
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<string[]>(`/api/v1/tags`),
    );
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
    return await this.handleRequest(() =>
      this.axiosInstance.put<string>(`/api/v1/tags`, request),
    );
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
    return await this.handleRequest(() =>
      this.axiosInstance.put<string>(`/api/v1/tags/${encodedTag}`, {
        Name: newTagName,
      }),
    );
  }

  /**
   * Deletes a tag from all messages.
   * @param tag - The name of the tag to delete.
   * @remarks This does NOT delete any messages
   * @returns Plain text "ok" response
   * ```typescript
   * await mailpit.deleteTag("Tag 1");
   * ```
   */
  public async deleteTag(tag: string): Promise<string> {
    const encodedTag = encodeURIComponent(tag);
    return await this.handleRequest(() =>
      this.axiosInstance.delete<string>(`/api/v1/tags/${encodedTag}`),
    );
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitChaosTriggersResponse>("/api/v1/chaos"),
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
    return await this.handleRequest(() =>
      this.axiosInstance.put<MailpitChaosTriggersResponse>(
        "/api/v1/chaos",
        triggers,
      ),
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<string>(`/view/${id}.html`, { params: { embed } }),
    );
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
    return await this.handleRequest(() =>
      this.axiosInstance.get<string>(`/view/${id}.txt`),
    );
  }
}
