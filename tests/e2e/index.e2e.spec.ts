import * as fs from "fs";
import path from "path";
import { describe, beforeAll, test, expect } from "@jest/globals";
import { MailpitClient, type MailpitSendRequest } from "../../src/index";
import dotenv from "dotenv";

dotenv.config();

describe("MailpitClient E2E Tests", () => {
  let mailpit: MailpitClient;
  let messageId: string;
  let attachmentId: string;

  // Common structures
  const address = {
    Address: expect.any(String),
    Name: expect.any(String),
  };

  beforeAll(() => {
    mailpit = new MailpitClient(
      `http://${process.env.HOST as string}:${process.env.PORT as string}`,
      {
        username: process.env.USERNAME as string,
        password: process.env.PASSWORD as string,
      },
    );
  });

  test("getInfo() should return mailpit server information", async () => {
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
    const config = await mailpit.getConfiguration();
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
        RecipientAllowlist: expect.any(String), // deprecated but still returned
        ReturnPath: expect.any(String),
        SMTPServer: expect.any(String),
      },
      SpamAssassin: expect.any(Boolean),
    });
  });

  test("sendMessage() should send message", async () => {
    const fileName = "test.png";
    const filePath = path.resolve(__dirname, fileName);
    const fileContent = fs.readFileSync(filePath).toString("base64");

    const sendRequest: MailpitSendRequest = {
      From: { Email: "sender@example.test", Name: "Sender Name" },
      To: [{ Email: "recipient@example.test", Name: "Recipient Name" }],
      Cc: [{ Email: "cc@example.test", Name: "Carbon Name" }],
      Bcc: ["bcc@example.test"],
      ReplyTo: [{ Email: "noreply@example.test", Name: "No Reply" }],
      Subject: "Test Email with Attachment",
      Text: "This is a test email with an attachment.",
      HTML: `<div style="text-align:center"><p>Mailpit is <b>awesome</b>!</p>
      <p>This is a test email with an inline image: <img src="cid:test-image" /></p></div>`,
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

    const sendResponse = await mailpit.sendMessage(sendRequest);
    expect(sendResponse).toEqual({
      ID: expect.any(String),
    });
    messageId = sendResponse.ID;
  });

  test("getMesssageSummary() should return thes summary of a message", async () => {
    const summary = await mailpit.getMessageSummary(messageId);

    const attachment = {
      ContentID: expect.any(String),
      ContentType: expect.any(String),
      FileName: expect.any(String),
      PartID: expect.any(String),
      Size: expect.any(Number),
    };
    expect(summary).toEqual({
      Attachments: [attachment],
      Bcc: [address],
      Cc: [address],
      Date: expect.any(String),
      From: address,
      HTML: expect.any(String),
      ID: expect.any(String),
      Inline: [attachment],
      ListUnsubscribe: {
        Errors: expect.any(String),
        Header: expect.any(String),
        HeaderPost: expect.any(String),
        Links: expect.any(Array),
      },
      MessageID: expect.any(String),
      ReplyTo: [address],
      ReturnPath: expect.any(String),
      Size: expect.any(Number),
      Subject: expect.any(String),
      Tags: expect.any(Array),
      Text: expect.any(String),
      To: [address],
    });
    attachmentId = summary.Attachments[0].PartID;
  });

  test("getMessageHeaders() should return the headers for a message", async () => {
    const headers = await mailpit.getMessageHeaders(messageId);
    const headerValue = [expect.any(String)];
    expect(headers).toEqual({
      Bcc: headerValue,
      Cc: headerValue,
      "Content-Type": headerValue,
      Date: headerValue,
      From: headerValue,
      "List-Unsubscribe": headerValue,
      "Message-Id": headerValue,
      "Mime-Version": headerValue,
      "Reply-To": headerValue,
      "Return-Path": headerValue,
      Subject: headerValue,
      To: headerValue,
    });
  });

  for (const method of ["getMessageAttachment", "getAttachementThumbnail"]) {
    test(`${method}() should return the attachment data and content type`, async () => {
      const attachment = await mailpit.getMessageAttachment(
        messageId,
        attachmentId,
      );
      expect(attachment).toEqual({
        data: expect.any(Buffer),
        contentType: expect.any(String),
      });
      expect(attachment.contentType).toBe("image/png");
    });
  }

  test("getMessageSource() should return the raw source of a message", async () => {
    const source = await mailpit.getMessageSource(messageId);
    expect(source).toEqual(expect.any(String));
  });

  // TODO: Figure out how to test this without error.
  // Also, use this for a error handling test
  // Mailpit API Error: 400 Bad Request at POST /api/v1/message/J4oLNEwtPMTjk5WRusXVWY/release: "SMTP error: error connecting to :0: dial tcp :0: connect: connection refused"
  test.skip("releaseMessage() should release a messsage", async () => {
    const releaseResponse = await mailpit.releaseMessage(messageId, {
      To: ["user1@example.test"],
    });
    console.log(releaseResponse);
    expect(releaseResponse).toEqual({
      ID: messageId,
    });
  });

  test("listMessages() should return a summary list of messages", async () => {
    const response = await mailpit.listMessages(0, 10);
    expect(response).toEqual({
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
          Tags: expect.any(Array),
          To: [address],
        },
      ]),
      messages_count: expect.any(Number),
      messages_unread: expect.any(Number),
      start: expect.any(Number),
      tags: expect.any(Array),
      total: expect.any(Number),
      unread: expect.any(Number),
      count: expect.any(Number), // depreated but stll returned
    });
  });

  // Next setReadStatus()
});
