import axios, {
  type AxiosInstance,
  type AxiosResponse,
  isAxiosError,
} from "axios";

// Common types
interface Address {
  Address: string;
  Name: string;
}

interface Email {
  Email: string;
  Name: string;
}

interface Attachment {
  ContentID: string;
  ContentType: string;
  FileName: string;
  PartID: string;
  Size: number;
}

interface ChaosTrigger {
  ErrorCode: number;
  Probability: number;
}

// Responses and Requests
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
}

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
}

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
}

export interface MailpitMessageHeadersResponse {
  [key: string]: string;
}

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

export interface MailpitSendMessageConfirmationResponse {
  ID: string;
}

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
}

export interface MailpitLinkCheckResponse {
  Errors: number;
  Links: {
    Status: string;
    StatusCode: number;
    URL: string;
  }[];
}

export interface MailpitSpamAssassinResponse {
  Errors: number;
  IsSpam: boolean;
  Rules: {
    Description: string;
    Name: string;
    Score: number;
  }[];
  Score: number;
}

export interface MailpitReadStatusRequest {
  IDs: string[];
  Read: boolean;
}

export interface MailpitDeleteRequest {
  IDs: string[];
}

export interface MailpitSearchRequest {
  query: string;
  start?: number;
  limit?: number;
  tz?: string;
}

export interface MailpitSearchDeleteRequest {
  query: string;
  tz?: string;
}

export interface MailpitSetTagsRequest {
  IDs: string[];
  Tags: string[];
}

export interface ChaosTriggersRequest {
  Authentication?: ChaosTrigger;
  Recipient?: ChaosTrigger;
  Sender?: ChaosTrigger;
}

export interface ChaosTriggersResponse {
  Authentication: ChaosTrigger;
  Recipient?: ChaosTrigger;
  Sender?: ChaosTrigger;
}

interface AttachmentResponse {
  data: ArrayBuffer;
  contentType: string;
}

export class MailpitClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string, auth?: { username: string; password: string }) {
    this.axiosInstance = axios.create({
      baseURL,
      auth,
      validateStatus: function (status) {
        return status === 200;
      },
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

  // Application
  public async getInfo(): Promise<MailpitInfoResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitInfoResponse>("/api/v1/info"),
    );
  }

  public async getConfiguration(): Promise<MailpitConfigurationResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitConfigurationResponse>("/api/v1/webui"),
    );
  }

  // Message
  public async getMessageSummary(
    id: string = "latest",
  ): Promise<MailpitMessageSummaryResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitMessageSummaryResponse>(
        `/api/v1/message/${id}`,
      ),
    );
  }

  public async getMessageHeaders(
    id: string = "latest",
  ): Promise<MailpitMessageHeadersResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitMessageHeadersResponse>(
        `/api/v1/message/${id}/headers`,
      ),
    );
  }

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

  public async getMessageSource(id: string = "latest"): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<string>(`/api/v1/message/${id}/raw`),
    );
  }

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

  // Other
  public async htmlCheck(
    id: string = "latest",
  ): Promise<MailpitHTMLCheckResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitHTMLCheckResponse>(
        `/api/v1/message/${id}/html-check`,
      ),
    );
  }

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

  public async spamAssassinCheck(
    id: string = "latest",
  ): Promise<MailpitSpamAssassinResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitSpamAssassinResponse>(
        `/api/v1/message/${id}/sa-check`,
      ),
    );
  }

  // Messages
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

  public async setReadStatus(
    readStatus: MailpitReadStatusRequest,
  ): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.put<string>(`/api/v1/messages`, readStatus),
    );
  }

  public async deleteMessages(
    deleteRequest?: MailpitDeleteRequest,
  ): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.delete<string>(`/api/v1/messages`, {
        data: deleteRequest,
      }),
    );
  }

  // See https://mailpit.axllent.org/docs/usage/search-filters/
  public async searchMessages(
    search: MailpitSearchRequest,
  ): Promise<MailpitMessagesSummaryResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<MailpitMessagesSummaryResponse>(`/api/v1/search`, {
        params: search,
      }),
    );
  }

  // See https://mailpit.axllent.org/docs/usage/search-filters/
  public async deleteMessagesBySearch(
    search: MailpitSearchDeleteRequest,
  ): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.delete<string>(`/api/v1/search`, { params: search }),
    );
  }

  // Tags
  public async getTags(): Promise<string[]> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<string[]>(`/api/v1/tags`),
    );
  }

  public async setTags(request: MailpitSetTagsRequest): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.put<string>(`/api/v1/tags`, request),
    );
  }

  public async renameTag(tag: string, newTagName: string): Promise<string> {
    const encodedTag = encodeURI(tag);
    return await this.handleRequest(() =>
      this.axiosInstance.put<string>(`/api/v1/tags/${encodedTag}`, {
        Name: newTagName,
      }),
    );
  }

  public async deleteTag(tag: string): Promise<string> {
    const encodedTag = encodeURI(tag);
    return await this.handleRequest(() =>
      this.axiosInstance.delete<string>(`/api/v1/tags/${encodedTag}`),
    );
  }

  // Testing
  public async renderMessageHTML(
    id: string = "latest",
    embed?: 1,
  ): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<string>(`/view/${id}.html`, { params: { embed } }),
    );
  }

  public async renderMessageText(id: string = "latest"): Promise<string> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<string>(`/view/${id}.txt`),
    );
  }

  public async getChaosTriggers(): Promise<ChaosTriggersResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.get<ChaosTriggersResponse>("/api/v1/chaos"),
    );
  }

  public async setChaosTriggers(
    triggers: ChaosTriggersRequest = {},
  ): Promise<ChaosTriggersResponse> {
    return await this.handleRequest(() =>
      this.axiosInstance.put<ChaosTriggersResponse>("/api/v1/chaos", triggers),
    );
  }
}
