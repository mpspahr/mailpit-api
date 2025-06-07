# mailpit-api

A NodeJS client library, written in TypeScript, to interact with the [Mailpit API](https://mailpit.axllent.org/docs/api-v1/view.html#get-/api/v1/info).

[![Package Version](https://img.shields.io/npm/v/mailpit-api.svg?label=npm)](https://www.npmjs.com/package/mailpit-api)
[![Test Suite](https://github.com/mpspahr/mailpit-api/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/mpspahr/mailpit-api/actions/workflows/npm-publish.yml)
[![Code Coverage](https://codecov.io/gh/mpspahr/mailpit-api/branch/main/graph/badge.svg?precision=2&label=coverage)](https://codecov.io/gh/mpspahr/mailpit-api)
[![Documentation](https://github.com/mpspahr/mailpit-api/actions/workflows/deploy-docs.yml/badge.svg?branch=main&label=docs)](https://mpspahr.github.io/mailpit-api/)

This package provides a convenient way to interact with [Mailpit](https://mailpit.axllent.org/) from your NodeJS applications.

## Documentation

Detailed documentation, including all available methods and type definitions, is available in our [online documentation](https://mpspahr.github.io/mailpit-api/).

## Installation

```bash
npm install mailpit-api
```

## Examples

All examples require a running Mailpit instance. For installation methods, see the [Mailpit installation guide](https://mailpit.axllent.org/docs/install/).

### Basic Usage with NodeJS

```typescript
import { MailpitClient } from "mailpit-api";

// Initialize the API client
const mailpit = new MailpitClient("http://localhost:8025");

// Send a message
await mailpit.sendMessage(
    From: { Email: "user@example.test" },
    To: [{ Email: "rec@example.test" }],
    Subject: "Test Email",
);

// Get a summary of all messages
const messages = await mailpit.listMessages();

// Delete all messages
await mailpit.deleteMessages();
```

### Using with Playwright Tests

Implement this `mailpit-api` package as a simple [Playwright test fixture](https://playwright.dev/docs/test-fixtures) and use it in a test.

```typescript
// fixtures.ts
import { test as base } from "@playwright/test";
import { MailpitClient } from "mailpit-api";

type MyFixtures = {
  mailpit: MailpitClient;
};

export const test = base.extend<MyFixtures>({
  mailpit: async ({}, use) => {
    const mailpit = new MailpitClient("http://localhost:8025");
    await mailpit.deleteMessages();
    await use(mailpit);
    await mailpit.deleteMessages();
  },
});

export { expect } from "@playwright/test";
```

```typescript
// tests/register.spec.ts
import { test, expect } from "../fixtures";

test("should receive welcome email after registration", async ({
  page,
  mailpit,
}) => {
  // Register
  await page.goto("http://your-app.test/register");
  await page.getByTestId("email").fill("test@example.com");
  await page.getByTestId("password").fill("password123");
  await page.getByTestId("submit").click();

  // Wait for success message on page
  await expect(page.getByTestId("success-message")).toBeVisible();

  // Get the welcome email
  const message = await mailpit.getMessageSummary(0);

  expect(message.Subject).toBe("Welcome to Our App");
  expect(message.To[0].Address).toBe("test@example.com");
});
```
