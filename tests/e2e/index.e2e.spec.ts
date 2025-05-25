import * as fs from "fs";
import path from "path";
import { describe, beforeAll, test, expect } from "@jest/globals";
import {
  MailpitClient,
  type MailpitSendRequest,
} from "../../src/index";
import dotenv from "dotenv";

dotenv.config();

describe("MailpitClient E2E Tests", () => {
  let mailpit: MailpitClient;
  let messageId: string;

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
        RecipientAllowlist: expect.any(String),
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
      Subject: "Test Email with Attachment",
      Text: "This is a test email with an attachment.",
      HTML: '<div style="text-align:center"><p>Mailpit is <b>awesome</b>!</p></div>',
      Headers: {
        "List-Unsubscribe":
          "<mailto:unsubscribe@example.test>, <https://example.test/unsubscribe>",
      },
      Attachments: [
        {
          Content: fileContent,
          Filename: fileName,
        },
      ],
    };

    const expected = await mailpit.sendMessage(sendRequest);
    expect(expected).toEqual({
      ID: expect.any(String),
    });
    messageId = expected.ID;
  });
});
