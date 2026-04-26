# mailpit-ws

[![Package Version](https://img.shields.io/npm/v/mailpit-ws.svg?label=npm)](https://www.npmjs.com/package/mailpit-ws)
[![Test Suite](https://github.com/mpspahr/mailpit-api/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/mpspahr/mailpit-api/actions/workflows/test.yml)
[![Code Coverage](https://codecov.io/gh/mpspahr/mailpit-api/graph/badge.svg?token=VUWKIYK1WM&flag=mailpit-ws)](https://codecov.io/gh/mpspahr/mailpit-api)
[![Documentation](https://github.com/mpspahr/mailpit-api/actions/workflows/deploy-docs.yml/badge.svg?branch=main&label=docs)](https://mpspahr.github.io/mailpit-api/modules/mailpit-ws.html)

A TypeScript WebSocket client for [Mailpit](https://mailpit.axllent.org/)'s real-time event stream. Get instant notifications when messages are received, updated, or deleted. Works in **Node.js, browser, and any modern JS runtime**.

For the REST API client, see [`mailpit-api`](https://www.npmjs.com/package/mailpit-api).

## Installation

```bash
npm install mailpit-api mailpit-ws
```

> `mailpit-api` is a peer dependency (required for shared types).

## Documentation

[Detailed documentation](https://mpspahr.github.io/mailpit-api/modules/mailpit-ws.html) covering all available methods and type definitions.

## Usage

**Prerequisites:** These examples require a Mailpit installation. See the [Mailpit installation guide](https://mailpit.axllent.org/docs/install/).

### Listening for Events

```typescript
import { MailpitEvents } from "mailpit-ws";

const events = new MailpitEvents("http://localhost:8025");

// Listen for new messages
const unsubscribe = events.onEvent("new", (event) => {
  console.log("New message:", event.Data.Subject);
});

// Stop listening
unsubscribe();

// Close the WebSocket connection
events.disconnect();
```

### Waiting for a Specific Event

```typescript
import { MailpitEvents } from "mailpit-ws";

const events = new MailpitEvents("http://localhost:8025");

// Wait for the next new message event (5 second timeout by default)
const event = await events.waitForEvent("new");
console.log("Received:", event.Data.Subject);

events.disconnect();
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

### Browser Note

> Basic authentication is **not supported for WebSocket connections in browsers**. The native `WebSocket` API does not allow custom headers. This limitation does not apply to Node.js.
