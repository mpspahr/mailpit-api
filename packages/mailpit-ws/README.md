# mailpit-ws

[![Package Version](https://img.shields.io/npm/v/mailpit-ws.svg?label=npm)](https://www.npmjs.com/package/mailpit-ws)
[![Test Suite](https://github.com/mpspahr/mailpit-api/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/mpspahr/mailpit-api/actions/workflows/test.yml)
[![Code Coverage](https://codecov.io/gh/mpspahr/mailpit-api/graph/badge.svg?token=VUWKIYK1WM&flag=mailpit-ws)](https://codecov.io/gh/mpspahr/mailpit-api)
[![Documentation](https://github.com/mpspahr/mailpit-api/actions/workflows/deploy-docs.yml/badge.svg?branch=main&label=docs)](https://mpspahr.github.io/mailpit-api/modules/mailpit-ws.html)

A TypeScript WebSocket client for [Mailpit](https://mailpit.axllent.org/)'s real-time event stream. Get instant notifications when messages are received, updated, or deleted. Works in **Node.js, browser, and any modern JS runtime**.

For the REST API client, see [`mailpit-api`](https://www.npmjs.com/package/mailpit-api).

## Installation

```bash
npm install mailpit-ws
```

> `mailpit-api` is a peer dependency. You may need to install it separately if your package manager does not auto-install peer dependencies.

## Documentation

[Detailed documentation](https://mpspahr.github.io/mailpit-api/modules/mailpit-ws.html) covering all available methods and type definitions.

## Usage

**Prerequisites:** These examples require a Mailpit installation. See the [Mailpit installation guide](https://mailpit.axllent.org/docs/install/).

### Listening for Events

```typescript
import { MailpitEvents } from "mailpit-ws";

const events = new MailpitEvents("http://localhost:8025");

// Register listener before connecting so no events are missed
const unsubscribe = events.onEvent("new", (event) => {
  console.log("New message:", event.Data.Subject);
});

// Ensure the socket is open before triggering any action that generates events
await events.connect();

// trigger app action that sends an email...

// Stop listening
unsubscribe();

// Close the WebSocket connection
events.disconnect();
```

### Playwright Fixture Pattern

If you are using Playwright fixtures, connect once in fixture setup and await it before any test actions run:

```typescript
import { test as base } from "@playwright/test";
import { MailpitEvents } from "mailpit-ws";

type Fixtures = { events: MailpitEvents };

export const test = base.extend<Fixtures>({
  events: async ({}, use) => {
    const events = new MailpitEvents("http://localhost:8025");

    // Ensure socket is ready before any test step can trigger events
    await events.connect();

    await use(events);
    events.disconnect();
  },
});

// In tests: register listeners, then trigger actions
test("captures new message event", async ({ events }) => {
  const newEventPromise = events.waitForEvent("new");
  // trigger app action that sends an email...
  const newEvent = await newEventPromise;
  console.log(newEvent.Type);
});
```

### Event Types

| Event      | Description                                |
| ---------- | ------------------------------------------ |
| `new`      | A new message was received                 |
| `stats`    | Mailbox statistics updated (total, unread) |
| `update`   | A message was updated (read status, tags)  |
| `delete`   | A message was deleted                      |
| `prune`    | Messages were pruned                       |
| `truncate` | All messages were deleted                  |
| `error`    | An error occurred                          |
| `*`        | Wildcard - receive all events              |

### Using with Authentication

```typescript
import { MailpitEvents } from "mailpit-ws";

const events = new MailpitEvents("http://localhost:8025", {
  auth: { username: "user", password: "pass" },
});
```

#### Browser Note

> Basic authentication is **not supported for WebSocket connections in browsers**. The native `WebSocket` API does not allow custom headers. This limitation does not apply to Node.js.
