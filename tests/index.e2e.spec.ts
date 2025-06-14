import * as fs from "fs";
import path from "path";
import { describe, test, expect, afterAll, afterEach } from "@jest/globals";
import {
  MailpitClient,
  MailpitConfigurationResponse,
  type MailpitSendRequest,
} from "../src/index";
import dotenv from "dotenv";

dotenv.config();

describe("MailpitClient E2E Tests", () => {
  // Ensure required environment variables are set
  const { HOST = "localhost", PORT = "8025", USERNAME, PASSWORD } = process.env;
  if (!USERNAME || !PASSWORD) {
    throw new Error("Missing required environment variables");
  }

  // Initialize MailpitClient with environment variables
  const mailpit = new MailpitClient(`http://${HOST}:${PORT}`, {
    username: USERNAME,
    password: PASSWORD,
  });

  // Attachemnt file setup
  const fileName = "test.png";
  const filePath = path.resolve(__dirname, fileName);
  const fileContent = fs.readFileSync(filePath).toString("base64");

  // Test email
  const sendRequest: MailpitSendRequest = {
    From: { Email: "sender@example.test", Name: "Sender Name" },
    To: [{ Email: "recipient@example.test", Name: "Recipient Name" }],
    Cc: [{ Email: "cc@example.test", Name: "Carbon Name" }],
    Bcc: ["bcc@example.test"],
    ReplyTo: [{ Email: "noreply@example.test", Name: "No Reply" }],
    Subject: "Test Email with Attachment",
    Text: "This is a test email with an attachment.",
    HTML: `<div style="text-align:center"><p>Mailpit is <b>awesome</b>!</p>
      <p>This is a test email with an inline image: <img src="cid:test-image" /></p></div>
      <p><a href="https://example.test">Example Link</a></p>`,
    Headers: {
      "List-Unsubscribe":
        "<mailto:unsubscribe@example.test>, <https://example.test/unsubscribe>",
    },
    Attachments: [
      {
        Content: fileContent,
        Filename: fileName,
      },
      {
        Content: fileContent,
        Filename: "test.png",
        ContentID: "inline-image",
        ContentType: "image/png",
      },
    ],
  };

  // Variables to hold config, message and attachment IDs
  let messageId: string;
  let attachmentId: string;
  let config: MailpitConfigurationResponse;

  // Common expect structures
  const address = {
    Address: expect.any(String),
    Name: expect.any(String),
  };

  const messages = {
    messages: expect.arrayContaining([
      {
        Attachments: expect.any(Number),
        Bcc: [address],
        Cc: [address],
        Created: expect.any(String),
        From: address,
        ID: expect.any(String),
        MessageID: expect.any(String),
        Read: expect.any(Boolean),
        ReplyTo: [address],
        Size: expect.any(Number),
        Snippet: expect.any(String),
        Subject: expect.any(String),
        Tags: expect.any(Array<string>),
        To: [address],
      },
    ]),
    messages_count: expect.any(Number),
    messages_unread: expect.any(Number),
    start: expect.any(Number),
    tags: expect.any(Array<string>),
    total: expect.any(Number),
    unread: expect.any(Number),
    count: expect.any(Number), // depreated but stll returned
  };

  afterAll(async () => {
    await mailpit.deleteMessages();
  });

  test("sendMessage() should send message", async () => {
    const sendResponse = await mailpit.sendMessage(sendRequest);
    expect(sendResponse).toEqual({
      ID: expect.any(String),
    });
    messageId = sendResponse.ID;
  });

  describe("Application Methods", () => {
    test("getInfo() should return Mailpit server information", async () => {
      const info = await mailpit.getInfo();
      expect(info).toEqual({
        Database: expect.any(String),
        DatabaseSize: expect.any(Number),
        LatestVersion: expect.any(String),
        Messages: expect.any(Number),
        RuntimeStats: {
          Memory: expect.any(Number),
          MessagesDeleted: expect.any(Number),
          SMTPAccepted: expect.any(Number),
          SMTPAcceptedSize: expect.any(Number),
          SMTPIgnored: expect.any(Number),
          SMTPRejected: expect.any(Number),
          Uptime: expect.any(Number),
        },
        Tags: expect.any(Object),
        Unread: expect.any(Number),
        Version: expect.any(String),
      });
    });

    test("getConfiguration() should return configuration for the web UI", async () => {
      config = await mailpit.getConfiguration();
      expect(config).toEqual({
        ChaosEnabled: expect.any(Boolean),
        DuplicatesIgnored: expect.any(Boolean),
        HideDeleteAllButton: expect.any(Boolean),
        Label: expect.any(String),
        MessageRelay: {
          AllowedRecipients: expect.any(String),
          BlockedRecipients: expect.any(String),
          Enabled: expect.any(Boolean),
          OverrideFrom: expect.any(String),
          PreserveMessageIDs: expect.any(Boolean),
          RecipientAllowlist: expect.any(String), // deprecated but still returned
          ReturnPath: expect.any(String),
          SMTPServer: expect.any(String),
        },
        SpamAssassin: expect.any(Boolean),
      });
    });
  });

  describe("Message(s) Methods", () => {
    test("getMesssageSummary() should return thes summary of a message", async () => {
      const expectedAttachment = {
        ContentID: expect.any(String),
        ContentType: expect.any(String),
        FileName: expect.any(String),
        PartID: expect.any(String),
        Size: expect.any(Number),
      };
      const expected = {
        Attachments: [expectedAttachment],
        Bcc: [address],
        Cc: [address],
        Date: expect.any(String),
        From: address,
        HTML: expect.any(String),
        ID: expect.any(String),
        Inline: [expectedAttachment],
        ListUnsubscribe: {
          Errors: expect.any(String),
          Header: expect.any(String),
          HeaderPost: expect.any(String),
          Links: expect.any(Array<string>),
        },
        MessageID: expect.any(String),
        ReplyTo: [address],
        ReturnPath: expect.any(String),
        Size: expect.any(Number),
        Subject: expect.any(String),
        Tags: expect.any(Array<string>),
        Text: expect.any(String),
        To: [address],
      };

      let summary = await mailpit.getMessageSummary();
      expect(summary).toEqual(expected);

      summary = await mailpit.getMessageSummary(messageId);
      expect(summary).toEqual(expected);
      // Store attachment ID for later tests
      attachmentId = summary.Attachments[0].PartID;
    });

    test("getMessageHeaders() should return the headers for a message", async () => {
      const expectedValues = [expect.any(String)];
      const expected = {
        Bcc: expectedValues,
        Cc: expectedValues,
        "Content-Type": expectedValues,
        Date: expectedValues,
        From: expectedValues,
        "List-Unsubscribe": expectedValues,
        "Message-Id": expectedValues,
        "Mime-Version": expectedValues,
        "Reply-To": expectedValues,
        "Return-Path": expectedValues,
        Subject: expectedValues,
        To: expectedValues,
      };
      let headers = await mailpit.getMessageHeaders();
      expect(headers).toEqual(expected);
      headers = await mailpit.getMessageHeaders(messageId);
      expect(headers).toEqual(expected);
    });

    test("getMessageSource() should return the raw source of a message", async () => {
      let source = await mailpit.getMessageSource();
      expect(source).toEqual(expect.any(String));
      source = await mailpit.getMessageSource(messageId);
      expect(source).toEqual(expect.any(String));
    });

    test("releaseMessage() should release a messsage", async () => {
      if (!config.MessageRelay.Enabled) {
        console.log(
          "Message relay is disabled, skipping releaseMessage() test.",
        );
        return;
      }
      const releaseResponse = await mailpit.releaseMessage(messageId, {
        To: ["user1@example.test"],
      });
      expect(releaseResponse).toEqual({
        ID: messageId,
      });
    });

    test("listMessages() should return a summary list of messages", async () => {
      let response = await mailpit.listMessages();
      expect(response).toEqual(messages);
      response = await mailpit.listMessages(0, 10);
      expect(response).toEqual(messages);
    });

    test("setReadStatus() should update the read status of a message", async () => {
      const response = await mailpit.setReadStatus({
        IDs: [messageId],
        Read: true,
      });
      expect(response).toBe("ok");
    });

    test("searchMessages() should return messages matching the search criteria", async () => {
      const searchRequest = {
        query: `subject:${sendRequest.Subject as string}`,
        start: 0,
        limit: 10,
      };
      const response = await mailpit.searchMessages(searchRequest);
      expect(response).toEqual(messages);
    });
  });

  describe("Attachment Methods", () => {
    test("getMessageAttachment() should return the attachment data and content type", async () => {
      const attachment = await mailpit.getMessageAttachment(
        messageId,
        attachmentId,
      );
      expect(attachment).toEqual({
        data: expect.any(Buffer),
        contentType: expect.any(String),
      });
      expect(attachment.contentType).toBe(`image/png`);
    });

    test("getAttachmentThumbnail() should return the attachment data and content type", async () => {
      const attachment = await mailpit.getAttachmentThumbnail(
        messageId,
        attachmentId,
      );
      expect(attachment).toEqual({
        data: expect.any(Buffer),
        contentType: expect.any(String),
      });
      expect(attachment.contentType).toBe(`image/jpeg`);
    });
  });

  describe("Delete Methods", () => {
    afterEach(async () => {
      if (!messageId) {
        const response = await mailpit.sendMessage(sendRequest);
        messageId = response.ID;
      }
    });

    test("deleteMessages() should delete a message", async () => {
      const response = await mailpit.deleteMessages({ IDs: [messageId] });
      expect(response).toBe("ok");
      messageId = ""; // Clear messageId after deletion
    });

    test("deleteMessagesBySearch() should delete messages matching the search criteria", async () => {
      const searchRequest = {
        query: `subject:${sendRequest.Subject as string}`,
      };
      const response = await mailpit.deleteMessagesBySearch(searchRequest);
      expect(response).toBe("ok");
      messageId = ""; // Clear messageId after deletion
    });
  });

  describe("Check Methods", () => {
    test("htmlCheck() should return HTML validation results for a message", async () => {
      const expected = {
        Platforms: expect.any(Object),
        Total: {
          Nodes: expect.any(Number),
          Partial: expect.any(Number),
          Supported: expect.any(Number),
          Tests: expect.any(Number),
          Unsupported: expect.any(Number),
        },
        Warnings: expect.arrayContaining([
          expect.objectContaining({
            Category: expect.any(String),
            Description: expect.any(String),
            Keywords: expect.any(String),
            NotesByNumber: expect.any(Object),
            Results: expect.arrayContaining([
              {
                Family: expect.any(String),
                Name: expect.any(String),
                NoteNumber: expect.any(String),
                Platform: expect.any(String),
                Support: expect.any(String),
                Version: expect.any(String),
              },
            ]),
            Score: {
              Found: expect.any(Number),
              Partial: expect.any(Number),
              Supported: expect.any(Number),
              Unsupported: expect.any(Number),
            },
            Slug: expect.any(String),
            Tags: expect.any(Array<string>),
            Title: expect.any(String),
            URL: expect.any(String),
          }),
        ]),
      };
      let response = await mailpit.htmlCheck();
      expect(response).toEqual(expected);
      response = await mailpit.htmlCheck(messageId);
      expect(response).toEqual(expected);
    });

    test("linkCheck() should return link checker results for a message", async () => {
      const expected = {
        Errors: expect.any(Number),
        Links: expect.arrayContaining([
          expect.objectContaining({
            Status: expect.any(String),
            StatusCode: expect.any(Number),
            URL: expect.any(String),
          }),
        ]),
      };
      let response = await mailpit.linkCheck();
      expect(response).toEqual(expected);
      response = await mailpit.linkCheck(messageId, true);
      expect(response).toEqual(expected);
    });

    test("spamAssassinCheck() should return SpamAssassin results for a message", async () => {
      if (!config.SpamAssassin) {
        console.log(
          "SpamAssassin is disabled, skipping spamAssassinCheck() test.",
        );
        return;
      }
      const response = await mailpit.spamAssassinCheck(messageId);
      expect(response).toEqual({
        Error: expect.any(String),
        IsSpam: expect.any(Boolean),
        Rules: expect.arrayContaining([
          expect.objectContaining({
            Description: expect.any(String),
            Name: expect.any(String),
            Score: expect.any(Number),
          }),
        ]),
        Score: expect.any(Number),
      });
    });
  });

  describe("Tagging Methods", () => {
    let tagName: string;
    afterAll(async () => {
      if (tagName) {
        await mailpit.deleteTag(tagName);
      }
    });
    test("setTags() should set tags for a message", async () => {
      const response = await mailpit.setTags({
        IDs: [messageId],
        Tags: ["test-tag"],
      });
      expect(response).toBe("ok");
      tagName = "test-tag"; // Store tagName for subsequent tests
    });

    test("renameTag() should set tags for a message", async () => {
      const response = await mailpit.renameTag(tagName, "renamed-tag");
      expect(response).toBe("ok");
      tagName = "renamed-tag"; // Update tagName for subsequent tests
    });

    test("getTags() should return all tags", async () => {
      const tags = await mailpit.getTags();
      expect(tags).toEqual(expect.arrayContaining([tagName]));
    });

    test("deleteTag() should delete a tag", async () => {
      const response = await mailpit.deleteTag(tagName);
      expect(response).toBe("ok");
      tagName = ""; // Clear tagName after deletion
    });
  });

  describe("Chaos Methods", () => {
    const newTriggers = {
      Authentication: { ErrorCode: 451, Probability: 5 },
      Recipient: { ErrorCode: 452, Probability: 10 },
      Sender: { ErrorCode: 453, Probability: 15 },
    };

    test("setChaosTriggers() should update the chaos triggers configuration", async () => {
      if (!config.ChaosEnabled) {
        console.log("Chaos is disabled, skipping setChaosTriggers() test.");
        return;
      }
      const response = await mailpit.setChaosTriggers(newTriggers);
      expect(response).toEqual(newTriggers);
    });

    test("getChaosTriggers() should return the current chaos triggers configuration", async () => {
      if (!config.ChaosEnabled) {
        console.log("Chaos is disabled, skipping getChaosTriggers() test.");
        return;
      }
      const triggers = await mailpit.getChaosTriggers();
      expect(triggers).toEqual(newTriggers);
    });
  });

  describe("Render Methods", () => {
    test("renderMessageHTML() should return the rendered HTML for a message", async () => {
      let html = await mailpit.renderMessageHTML();
      expect(html).toContain(sendRequest.HTML);
      html = await mailpit.renderMessageHTML(messageId, 1);
      // Contains extra embedded information
      expect(html).not.toContain(sendRequest.HTML);
      expect(html).toContain('target="_blank" rel="noreferrer noopener"');
    });

    test("renderMessageText() should return the rendered text for a message", async () => {
      let text = await mailpit.renderMessageText();
      expect(text).toContain(sendRequest.Text);
      text = await mailpit.renderMessageText(messageId);
      expect(text).toContain(sendRequest.Text);
    });
  });

  describe("Error Handling", () => {
    test("invalid authentication (response)", async () => {
      const invalidAuthMailpit = new MailpitClient(`http://${HOST}:${PORT}`, {
        username: USERNAME,
        password: "invalid-password",
      });
      await expect(invalidAuthMailpit.getInfo()).rejects.toThrow(
        'Mailpit API Error: 401 Unauthorized at GET /api/v1/info: "Unauthorised.\\n"',
      );
    });

    test("invalid host (request)", async () => {
      const invalidUrlMailpit = new MailpitClient("http://invalid-host:9999");
      await expect(invalidUrlMailpit.getInfo()).rejects.toThrow(
        "Mailpit API Error: No response received from server at GET /api/v1/info",
      );
    });

    test("malformed protocol (non-AxiosError)", async () => {
      const malformedMailpit = new MailpitClient("ht!tp://bad-url");
      await expect(malformedMailpit.getInfo()).rejects.toThrow(
        "Unexpected Error: TypeError: Invalid URL",
      );
    });
  });
});
