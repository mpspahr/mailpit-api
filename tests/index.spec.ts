import {
  jest,
  describe,
  beforeEach,
  afterEach,
  expect,
  test,
} from "@jest/globals";
import axios, { AxiosInstance } from "axios";
import {
  MailpitClient,
  MailpitSendRequest,
  MailpitSetTagsRequest,
  MailpitReadStatusRequest,
  MailpitSearchMessagesRequest,
  MailpitSearchRequest,
} from "../src/index";

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
      request: jest.fn(),
      create: jest.fn(),
      defaults: {},
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    } as unknown as jest.Mocked<AxiosInstance>;

    // Mock axios.create to return our mocked instance
    (axios.create as jest.Mock).mockReturnValue(mockedAxios);

    client = new MailpitClient("http://localhost:8025");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should call getInfo and return info", async () => {
    const mockData = {
      Database: "db",
      DatabaseSize: 1,
      LatestVersion: "v",
      Messages: 1,
      RuntimeStats: {},
      Tags: {},
      Unread: 0,
      Version: "v",
    };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.getInfo();
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/info");
    expect(result).toEqual(mockData);
  });

  test("should call getConfiguration and return config", async () => {
    const mockData = {
      ChaosEnabled: false,
      DuplicatesIgnored: false,
      Label: "test",
      MessageRelay: {},
      SpamAssassin: false,
    };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.getConfiguration();
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/webui");
    expect(result).toEqual(mockData);
  });

  test("should call getMessageSummary and return summary", async () => {
    const mockData = {
      Attachments: [],
      Bcc: [],
      Cc: [],
      Date: "",
      From: { Address: "", Name: "" },
      HTML: "",
      ID: "id",
      Inline: [],
      ListUnsubscribe: {},
      MessageID: "",
      ReplyTo: [],
      ReturnPath: "",
      Size: 0,
      Subject: "",
      Tags: [],
      Text: "",
      To: [],
    };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.getMessageSummary("id");
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/message/id");
    expect(result).toEqual(mockData);
  });

  test("should call getMessageHeaders and return headers", async () => {
    const mockData = { Subject: ["Test"] };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.getMessageHeaders("id");
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/message/id/headers");
    expect(result).toEqual(mockData);
  });

  test("should call getMessageAttachment and return attachment data", async () => {
    const mockBuffer = new ArrayBuffer(8);
    const mockHeaders = { "content-type": "image/png" };
    mockedAxios.get.mockResolvedValue({
      data: mockBuffer,
      headers: mockHeaders,
    });
    const result = await client.getMessageAttachment("id", "part");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/api/v1/message/id/part/part",
      { responseType: "arraybuffer" },
    );
    expect(result).toEqual({ data: mockBuffer, contentType: "image/png" });
  });

  test("should call getAttachmentThumbnail and return thumbnail data", async () => {
    const mockBuffer = new ArrayBuffer(8);
    const mockHeaders = { "content-type": "image/jpeg" };
    mockedAxios.get.mockResolvedValue({
      data: mockBuffer,
      headers: mockHeaders,
    });
    const result = await client.getAttachmentThumbnail("id", "part");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/api/v1/message/id/part/part/thumb",
      { responseType: "arraybuffer" },
    );
    expect(result).toEqual({ data: mockBuffer, contentType: "image/jpeg" });
  });

  test("should call getMessageSource and return source", async () => {
    mockedAxios.get.mockResolvedValue({ data: "raw source" });
    const result = await client.getMessageSource("id");
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/message/id/raw");
    expect(result).toBe("raw source");
  });

  test("should call releaseMessage and return ok", async () => {
    mockedAxios.post.mockResolvedValue({ data: "ok" });
    const result = await client.releaseMessage("id", { To: ["a@b.com"] });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/api/v1/message/id/release",
      { To: ["a@b.com"] },
    );
    expect(result).toBe("ok");
  });

  test("should call sendMessage and return confirmation", async () => {
    const mockData = { ID: "123" };
    const sendRequest: MailpitSendRequest = {
      From: { Email: "a", Name: "b" },
      To: [{ Email: "c" }],
    };
    mockedAxios.post.mockResolvedValue({ data: mockData });
    const result = await client.sendMessage(sendRequest);
    expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/send", sendRequest);
    expect(result).toEqual(mockData);
  });

  test("should call listMessages and return messages summary", async () => {
    const mockData = {
      messages: [],
      messages_count: 0,
      messages_unread: 0,
      start: 0,
      tags: [],
      total: 0,
      unread: 0,
    };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.listMessages(1, 2);
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/messages", {
      params: { start: 1, limit: 2 },
    });
    expect(result).toEqual(mockData);
  });

  test("should call setReadStatus and return ok", async () => {
    mockedAxios.put.mockResolvedValue({ data: "ok" });
    const req: MailpitReadStatusRequest = { Read: true, IDs: ["1"] };
    const params = { tz: "UTC" };
    const result = await client.setReadStatus(req, params);
    expect(mockedAxios.put).toHaveBeenCalledWith("/api/v1/messages", req, {
      params,
    });
    expect(result).toBe("ok");
  });

  test("should call deleteMessages and return ok", async () => {
    mockedAxios.delete.mockResolvedValue({ data: "ok" });
    const result = await client.deleteMessages({ IDs: ["1"] });
    expect(mockedAxios.delete).toHaveBeenCalledWith("/api/v1/messages", {
      data: { IDs: ["1"] },
    });
    expect(result).toBe("ok");
  });

  test("should call searchMessages and return summary", async () => {
    const mockData = {
      messages: [],
      messages_count: 0,
      messages_unread: 0,
      start: 0,
      tags: [],
      total: 0,
      unread: 0,
    };
    const search: MailpitSearchMessagesRequest = {
      query: "test",
      start: 0,
      limit: 10,
    };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.searchMessages(search);
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/search", {
      params: search,
    });
    expect(result).toEqual(mockData);
  });

  test("should call deleteMessagesBySearch and return ok", async () => {
    mockedAxios.delete.mockResolvedValue({ data: "ok" });
    const search: MailpitSearchRequest = { query: "test" };
    const result = await client.deleteMessagesBySearch(search);
    expect(mockedAxios.delete).toHaveBeenCalledWith("/api/v1/search", {
      params: search,
    });
    expect(result).toBe("ok");
  });

  test("should call htmlCheck and return html check response", async () => {
    const mockData = {
      Platforms: {},
      Total: { Nodes: 0, Partial: 0, Supported: 0, Tests: 0, Unsupported: 0 },
      Warnings: [],
    };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.htmlCheck("id");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/api/v1/message/id/html-check",
    );
    expect(result).toEqual(mockData);
  });

  test("should call linkCheck and return link check response", async () => {
    const mockData = { Errors: 0, Links: [] };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.linkCheck("id", "true");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/api/v1/message/id/link-check",
      { params: { follow: "true" } },
    );
    expect(result).toEqual(mockData);
  });

  test("should call spamAssassinCheck and return spam check response", async () => {
    const mockData = { Errors: 0, IsSpam: false, Rules: [], Score: 0 };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.spamAssassinCheck("id");
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/message/id/sa-check");
    expect(result).toEqual(mockData);
  });

  test("should call getTags and return tags", async () => {
    const mockData = ["tag1", "tag2"];
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.getTags();
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/tags");
    expect(result).toEqual(mockData);
  });

  test("should call setTags and return ok", async () => {
    mockedAxios.put.mockResolvedValue({ data: "ok" });
    const req: MailpitSetTagsRequest = { IDs: ["1"], Tags: ["tag"] };
    const result = await client.setTags(req);
    expect(mockedAxios.put).toHaveBeenCalledWith("/api/v1/tags", req);
    expect(result).toBe("ok");
  });

  test("should call renameTag and return ok", async () => {
    mockedAxios.put.mockResolvedValue({ data: "ok" });
    const result = await client.renameTag("old", "new");
    expect(mockedAxios.put).toHaveBeenCalledWith("/api/v1/tags/old", {
      Name: "new",
    });
    expect(result).toBe("ok");
  });

  test("should handle errors in handleRequest", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: "error" } });
    await expect(client.getInfo()).rejects.toBeDefined();
  });
});
