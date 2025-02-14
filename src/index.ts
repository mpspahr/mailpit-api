import axios, {
  type AxiosInstance,
  type AxiosResponse,
  isAxiosError,
} from "axios";

// Common types
interface Address {
  Address: string;
  Name: string;
};

interface Email {
  Email: string;
  Name: string;
}

/**
 * Represents an attachment in an email message.
 */
interface Attachment {
  ContentID: string;
  ContentType: string;
  FileName: string;
  PartID: string;
  Size: number;
};

/**
 * Represents a chaos trigger for the Mailpit API.
 */
interface ChaosTrigger {
  ErrorCode: number;
  Probability: number;
};

// Responses and Requests
/**
 * Response from the Mailpit API containing information about the Mailpit instance.
 */
export interface MailpitInfoResponse {
  Database: string;
  DatabaseSize: number;
  LatestVersion: string;
  Messages: number;
  RuntimeStats: {
    Memory: number;
    MessagesDeleted: number;
    SMTPAccepted: number;
    SMTPAcceptedSize: number;
    SMTPIgnored: number;
    SMTPRejected: number;
    Uptime: number;
  };
  Tags: {
    [key: string]: number;
  };
  Unread: number;
  Version: string;
};

/**
 * Response from the Mailpit API containing configuration details.
 */
export interface MailpitConfigurationResponse {
  DuplicatesIgnored: boolean;
  Label: string;
  SpamAssassin: boolean;
  MessageRelay: {
    AllowedRecipients: string;
    Enabled: boolean;
    ReturnPath: string;
    SMTPServer: string;
  };
};

/**
 * Summary of a single message from the Mailpit API.
 */
export interface MailpitMessageSummaryResponse {
  Attachments: Attachment[];
  Bcc: Address[];
  Cc: Address[];
  Date: string;
  From: Address;
  HTML: string;
  ID: string;
  Inline: Attachment[];
  MessageID: string;
  ReplyTo: Address[];
  ReturnPath: string;
  Size: number;
  Subject: string;
  Tags: string[];
  Text: string;
  To: Address[];
}

/**
 * Response from the Mailpit API containing a summary of multiple messages.
 */
export interface MailpitMessagesSummaryResponse {
  messages: {
    Attachments: number;
    Size: number;
    Snippet: string;
    Subject: string;
    Tags: string[];
    ID: string;
    MessageID: string;
    Read: boolean;
    Bcc: Address[];
    Cc: Address[];
    From: Address;
    ReplyTo: Address[];
    To: Address[];
  }[];
  messages_count: number;
  start: number;
  tags: string[];
  total: number;
  unread: number;
};

/**
 * Response from the Mailpit API containing message headers.
 */
export interface MailpitMessageHeadersResponse {
  [key: string]: string;
};

/**
 * Request to send a message via the Mailpit API.
 */
export interface MailpitSendRequest {
  Attachments: {
    Content: string;
    Filename: string;
  }[];
  Bcc: string[];
  Cc: Email[];
  From: Email;
  HTML: string;
  Headers: {
    [key: string]: string;
  };
  ReplyTo: Email[];
  Subject: string;
  Tags: string[];
  Text: string;
  To: Email[];
}

/**
 * Response from the Mailpit API confirming a sent message.
 */
export interface MailpitSendMessageConfirmationResponse {
  ID: string;
};

/**
 * Response from the Mailpit API containing HTML check results.
 */
export interface MailpitHTMLCheckResponse {
  Platforms: {
    [key: string]: [string];
  };
  Total: {
    Nodes: number;
    Partial: number;
    Supported: number;
    Tests: number;
    Unsupported: number;
  };
  Warnings: {
    Category: "css" | "html";
    Description: string;
    Keywords: string;
    NotesByNumber: {
      [key: string]: string;
    };
    Results: {
      Family: string;
      Name: string;
      NoteNumber: string;
      Platform: string;
      Support: "yes" | "no" | "partial";
      Version: string;
    }[];
    Score: {
      Found: number;
      Partial: number;
      Supported: number;
      Unsupported: number;
    };
    Slug: string;
    Tags: string[];
    Title: string;
    URL: string;
  }[];
};

/**
 * Response from the Mailpit API containing link check results.
 */
export interface MailpitLinkCheckResponse {
  Errors: number;
  Links: {
    Status: string;
    StatusCode: number;
    URL: string;
  }[];
};

/**
 * Response from the Mailpit API containing SpamAssassin check results.
 */
export interface MailpitSpamAssassinResponse {
  Errors: number;
  IsSpam: boolean;
  Rules: {
    Description: string;
    Name: string;
    Score: number;
  }[];
  Score: number;
};

/**
 * Request to set read status of messages via the Mailpit API.
 */
export interface MailpitReadStatusRequest {
  IDs: string[];
  Read: boolean;
};

/**
 * Request to delete messages via the Mailpit API.
 */
export interface MailpitDeleteRequest {
  IDs: string[];
};

/**
 * Request to search messages via the Mailpit API.
 */
export interface MailpitSearchRequest {
  query: string;
  start?: number;
  limit?: number;
  tz?: string;
};

/**
 * Request to delete messages by search via the Mailpit API.
 */
export interface MailpitSearchDeleteRequest {
  query: string;
  tz?: string;
};

/**
 * Request to set tags on messages via the Mailpit API.
 */
export interface MailpitSetTagsRequest {
  IDs: string[];
  Tags: string[];
};

/**
 * Request to set chaos triggers via the Mailpit API.
 */
export interface ChaosTriggersRequest {
  Authentication?: ChaosTrigger;
  Recipient?: ChaosTrigger;
  Sender?: ChaosTrigger;
};

/**
 * Response from the Mailpit API containing chaos triggers.
 */
export interface ChaosTriggersResponse {
  Authentication: ChaosTrigger;
  Recipient?: ChaosTrigger;
  Sender?: ChaosTrigger;
};

interface AttachmentResponse {
  data: ArrayBuffer;
  contentType: string;
}

/**
 * Client for interacting with the Mailpit API.
 */
export class MailpitClient {
  private axiosInstance: AxiosInstance;

  /**
   * Creates an instance of MailpitClient.
   * @param baseURL - The base URL of the Mailpit API.
   * @param auth - Optional authentication credentials.
   * @param auth.username - The username for basic authentication.
   * @param auth.password - The password for basic authentication.
   */
  constructor(baseURL: string, auth?: { username: string; password: string }) {
    this.axiosInstance = axios.create({
      baseURL,
      auth,
      validateStatus: function (status) {
        return status === 200;
      }
    });
  }

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
   * @returns A promise that resolves to a MailpitInfoResponse.
   */
  public async getInfo(): Promise<MailpitInfoResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitInfoResponse>("/api/v1/info"),
    );
  }

  /**
   * Retrieves the configuration of the Mailpit instance.
   * @returns A promise that resolves to a MailpitConfigurationResponse.
   */
  public async getConfiguration(): Promise<MailpitConfigurationResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitConfigurationResponse>("/api/v1/webui"),
    );
  }

  /**
   * Retrieves a summary of a specific message.
   * @param id - The ID of the message. Defaults to "latest".
   * @returns A promise that resolves to a MailpitMessageSummaryResponse.
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
   * @param id - The ID of the message. Defaults to "latest".
   * @returns A promise that resolves to a MailpitMessageHeadersResponse.
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
   * Retrieves a specific attachment of a message.
   * @param id - The ID of the message.
   * @param partID - The part ID of the attachment.
   * @returns A promise that resolves to a string containing the attachment.
   */
  public async getMessageAttachment(
    id: string,
    partID: string,
  ): Promise<AttachmentResponse> {
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
   * Retrieves the raw source of a specific message.
   * @param id - The ID of the message. Defaults to "latest".
   * @returns A promise that resolves to a string containing the raw message source.
   */
  public async getMessageSource(id: string = "latest"): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<string>(`/api/v1/message/${id}/raw`),
    );
  }

  /**
   * Retrieves the thumbnail of a specific attachment.
   * @param id - The ID of the message.
   * @param partID - The part ID of the attachment.
   * @returns A promise that resolves to a string containing the thumbnail.
   */
  public async getAttachmentThumbnail(
    id: string,
    partID: string,
  ): Promise<AttachmentResponse> {
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
   * Releases a specific message to the specified recipients.
   * @param id - The ID of the message.
   * @param releaseRequest - The release request containing the recipients.
   * @returns A promise that resolves to a string.
   */
  public async releaseMessage(
    id: string,
    releaseRequest: { To: string[] },
  ): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.post<string>(
        `/api/v1/message/${id}/release`,
        releaseRequest,
      ),
    );
  }

  /**
   * Sends a message via the Mailpit API.
   * @param sendReqest - The request containing the message details.
   * @returns A promise that resolves to a MailpitSendMessageConfirmationResponse.
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
   * Performs an HTML check on a specific message.
   * @param id - The ID of the message. Defaults to "latest".
   * @returns A promise that resolves to a MailpitHTMLCheckResponse.
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
   * @param id - The ID of the message. Defaults to "latest".
   * @param follow - Whether to follow links. Defaults to "false".
   * @returns A promise that resolves to a MailpitLinkCheckResponse.
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
   * Performs a SpamAssassin check on a specific message.
   * @param id - The ID of the message. Defaults to "latest".
   * @returns A promise that resolves to a MailpitSpamAssassinResponse.
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
   * Retrieves a list of messages.
   * @param start - The starting index. Defaults to 0.
   * @param limit - The number of messages to retrieve. Defaults to 50.
   * @returns A promise that resolves to a MailpitMessagesSummaryResponse.
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
   * Sets the read status of messages.
   * @param readStatus - The request containing the message IDs and read status.
   * @returns A promise that resolves to a string.
   */
  public async setReadStatus(
    readStatus: MailpitReadStatusRequest,
  ): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.put<string>(`/api/v1/messages`, readStatus),
    );
  }

  /**
   * Deletes messages.
   * @param deleteRequest - The request containing the message IDs to delete.
   * @returns A promise that resolves to a string.
   */
  public async deleteMessages(
    deleteRequest?: MailpitDeleteRequest,
  ): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.delete<string>(`/api/v1/messages`, {
        data: deleteRequest,
      }),
    );
  }

  /**
   * Searches for messages.
   * @param search - The search request containing the query and optional parameters.
   * @returns A promise that resolves to a MailpitMessagesSummaryResponse.
   */
  public async searchMessages(
    search: MailpitSearchRequest,
  ): Promise<MailpitMessagesSummaryResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitMessagesSummaryResponse>(`/api/v1/search`, {
        params: search,
      }),
    );
  }

  /**
   * Deletes messages by search.
   * @param search - The search request containing the query.
   * @returns A promise that resolves to a string.
   */
  public async deleteMessagesBySearch(
    search: MailpitSearchDeleteRequest,
  ): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.delete<string>(`/api/v1/search`, { params: search }),
    );
  }

  /**
   * Retrieves a list of tags.
   * @returns A promise that resolves to an array of strings containing the tags.
   */
  public async getTags(): Promise<string[]> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<string[]>(`/api/v1/tags`),
    );
  }

  /**
   * Sets tags on messages.
   * @param request - The request containing the message IDs and tags.
   * @returns A promise that resolves to a string.
   */
  public async setTags(request: MailpitSetTagsRequest): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.put<string>(`/api/v1/tags`, request),
    );
  }

  /**
   * Renames a tag.
   * @param tag - The current name of the tag.
   * @param newTagName - The new name of the tag.
   * @returns A promise that resolves to a string.
   */
  public async renameTag(tag: string, newTagName: string): Promise<string> {
    const encodedTag = encodeURI(tag);
    return await this.handleRequest(() =>
      this.axiosInstance.put<string>(`/api/v1/tags/${encodedTag}`, {
        Name: newTagName,
      }),
    );
  }

  /**
   * Deletes a tag.
   * @param tag - The name of the tag to delete.
   * @returns A promise that resolves to a string.
   */
  public async deleteTag(tag: string): Promise<string> {
    const encodedTag = encodeURI(tag);
    return await this.handleRequest(() =>
      this.axiosInstance.delete<string>(`/api/v1/tags/${encodedTag}`),
    );
  }

  /**
   * Renders the HTML view of a specific message.
   * @param id - The ID of the message. Defaults to "latest".
   * @param embed - Whether to embed images. Defaults to undefined.
   * @returns A promise that resolves to a string containing the HTML view.
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
   * Renders the text view of a specific message.
   * @param id - The ID of the message. Defaults to "latest".
   * @returns A promise that resolves to a string containing the text view.
   */
  public async renderMessageText(id: string = "latest"): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<string>(`/view/${id}.txt`),
    );
  }

  /**
   * Retrieves the chaos triggers.
   * @returns A promise that resolves to a ChaosTriggersResponse.
   */
  public async getChaosTriggers(): Promise<ChaosTriggersResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<ChaosTriggersResponse>("/api/v1/chaos"),
    );
  }

  /**
   * Sets the chaos triggers.
   * @param triggers - The request containing the chaos triggers.
   * @returns A promise that resolves to a ChaosTriggersResponse.
   */
  public async setChaosTriggers(
    triggers: ChaosTriggersRequest = {},
  ): Promise<ChaosTriggersResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.put<ChaosTriggersResponse>("/api/v1/chaos", triggers),
    );
  }
}
