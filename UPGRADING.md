# Breaking Changes

## v2.0.0

### Node.js 18+ required

`mailpit-api` v2.0.0 requires Node.js 18 or later. Node 18 introduced the global `fetch` API, which this package relies on. Older Node.js versions are no longer supported.

### `MailpitClient` constructor signature changed

The second argument to `MailpitClient` has changed from a flat `{ username, password }` object to a nested options object.

**Before:**

```typescript
const mailpit = new MailpitClient("http://localhost:8025", {
  username: "user",
  password: "pass",
});
```

**After:**

```typescript
const mailpit = new MailpitClient("http://localhost:8025", {
  auth: { username: "user", password: "pass" },
});
```

The options object also accepts an optional `fetchOptions` field (see below).

### `fetchOptions` moved into the options object

`fetchOptions` was previously a flat third parameter to `MailpitClient`. It is now a property of the second options object, alongside `auth`.

**Before:**

```typescript
const mailpit = new MailpitClient(
  "http://localhost:8025",
  { username: "user", password: "pass" },
  {
    headers: { Cookie: "session=abc123" },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  },
);
```

**After:**

```typescript
import { Agent } from "undici";
const mailpit = new MailpitClient("https://localhost:8025", {
  auth: { username: "user", password: "pass" },
  fetchOptions: {
    headers: { Cookie: "session=abc123" },
    dispatcher: new Agent({ connect: { rejectUnauthorized: false } }),
  },
});
```

`fetchOptions` accepts any `RequestInit` field except `method` and `body`, which are managed internally. This includes `headers` (e.g. for cookies), `signal`, `cache`, `keepalive`, and Node.js-specific options like `dispatcher`.

### WebSocket functionality moved to `mailpit-ws`

All WebSocket/event-related functionality has been extracted into a separate [`mailpit-ws`](https://www.npmjs.com/package/mailpit-ws) package to make `mailpit-api` zero-dependency. The `MailpitClient` class no longer includes WebSocket methods.

**Moved methods** (now in `mailpit-ws`):\*

- `disconnect()`
- `onEvent()`
- `waitForEvent()`

**Migration:**

`mailpit-ws` lists `mailpit-api` as a peer dependency, which npm installs automatically:

```bash
npm install mailpit-ws
```

```typescript
// Before
import { MailpitClient } from "mailpit-api";
const mailpit = new MailpitClient("http://localhost:8025", {
  username: "user",
  password: "pass",
});
mailpit.onEvent("new", (event) => console.log(event));
mailpit.disconnect();

// After
import { MailpitEvents } from "mailpit-ws";
const events = new MailpitEvents("http://localhost:8025", {
  auth: { username: "user", password: "pass" },
});
events.onEvent("new", (event) => console.log(event));
events.disconnect();
```

**Moved types** (now in `mailpit-ws`): `MailpitEvent`, `MailpitEventMap`, `MailpitEventType`, `MailpitStatsData`, `MailpitUpdateData`, `MailpitDeleteData`, `MailpitErrorData`, `MailpitNewMessageEvent`, `MailpitStatsEvent`, `MailpitUpdateEvent`, `MailpitDeleteEvent`, `MailpitPruneEvent`, `MailpitTruncateEvent`, `MailpitErrorEvent`.

**Removed type alias:** `MailpitMessageSummary` (was identical to `MailpitMessageListItem`) has been removed from both `mailpit-api` and `mailpit-ws`. Use `MailpitMessageListItem` directly.

### `getMessageAttachment()` and `getAttachmentThumbnail()` now return `Blob` directly

Previously these methods returned a `MailpitAttachmentDataResponse` object (`{ data: ArrayBuffer | Buffer, contentType: string }`). They now return a `Blob` directly. The MIME type is available via `blob.type`. The `MailpitAttachmentDataResponse` type has been removed.

**Before:**

```typescript
const { data, contentType } = await mailpit.getMessageAttachment(id, partID);
expect(contentType).toBe("image/jpeg");
expect(data.byteLength).toBeGreaterThan(0);
```

**After:**

```typescript
const blob = await mailpit.getMessageAttachment(id, partID);
expect(blob.type).toBe("image/jpeg");
expect(blob.size).toBeGreaterThan(0);
```

### Error messages now include the full URL

Previously, error messages contained only the relative API path (e.g., `/api/v1/info`). They now include the full URL (e.g., `http://localhost:8025/api/v1/info`).

**Before:**

```
Mailpit API Error: 404 Not Found at GET /api/v1/info: "not found"
```

**After:**

```
Mailpit API Error: 404 Not Found at GET http://localhost:8025/api/v1/info: "not found"
```
