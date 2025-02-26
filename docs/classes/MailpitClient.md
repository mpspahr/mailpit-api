[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitClient

# Class: MailpitClient

Defined in: [index.ts:424](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L424)

Client for interacting with the [Mailpit API](https://mailpit.axllent.org/docs/api-v1/).

## Example

```typescript
import { MailpitClient } from "mailpit-api";
const mailpit = new MailpitClient("http://localhost:8025");
console.log(await mailpit.getInfo());
```

## Constructors

### new MailpitClient()

> **new MailpitClient**(`baseURL`, `auth`?): [`MailpitClient`](MailpitClient.md)

Defined in: [index.ts:445](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L445)

Creates an instance of [MailpitClient](MailpitClient.md).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `baseURL` | `string` | The base URL of the Mailpit API. |
| `auth`? | \{ `password`: `string`; `username`: `string`; \} | Optional authentication credentials. |
| `auth.password`? | `string` | The password for basic authentication. |
| `auth.username`? | `string` | The username for basic authentication. |

#### Returns

[`MailpitClient`](MailpitClient.md)

#### Examples

```typescript
const mailpit = new MailpitClient("http://localhost:8025");
```

```typescript
const mailpit = new MailpitClient("http://localhost:8025", {
 username: "admin",
 password: "supersecret",
});
```

## Methods

### deleteMessages()

> **deleteMessages**(`deleteRequest`?): `Promise`\<`string`\>

Defined in: [index.ts:765](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L765)

Delete individual or all messages.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `deleteRequest`? | [`MailpitDatabaseIDsRequest`](../interfaces/MailpitDatabaseIDsRequest.md) | The request containing the message database IDs to delete. |

#### Returns

`Promise`\<`string`\>

Plain text "ok" response

#### Remarks

If no `IDs` are provided then all messages are deleted.

#### Example

```typescript
// Delete all messages
await mailpit.deleteMessages();

// Delete specific messages
await mailpit.deleteMessages({ IDs: ["1", "2", "3"] });
```

***

### deleteMessagesBySearch()

> **deleteMessagesBySearch**(`search`): `Promise`\<`string`\>

Defined in: [index.ts:809](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L809)

Delete all messages matching a search.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `search` | [`MailpitSearchRequest`](../interfaces/MailpitSearchRequest.md) | The search request containing the query. |

#### Returns

`Promise`\<`string`\>

Plain text "ok" response

#### See

[Search filters](https://mailpit.axllent.org/docs/usage/search-filters/)

#### Example

```typescript
// Delete all messages from the domain example.test
await mailpit.deleteMessagesBySearch({query: "from:example.test"});
```

***

### deleteTag()

> **deleteTag**(`tag`): `Promise`\<`string`\>

Defined in: [index.ts:943](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L943)

Deletes a tag from all messages.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tag` | `string` | The name of the tag to delete. |

#### Returns

`Promise`\<`string`\>

Plain text "ok" response
```typescript
await mailpit.deleteTag("Tag 1");
```

#### Remarks

This does NOT delete any messages

***

### getAttachmentThumbnail()

> **getAttachmentThumbnail**(`id`, `partID`): `Promise`\<[`MailpitAttachmentDataResponse`](../interfaces/MailpitAttachmentDataResponse.md)\>

Defined in: [index.ts:622](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L622)

Generates a cropped 180x120 JPEG thumbnail of an image attachment from a message.
Only image attachments are supported.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | Message database ID or "latest" |
| `partID` | `string` | The attachment part ID |

#### Returns

`Promise`\<[`MailpitAttachmentDataResponse`](../interfaces/MailpitAttachmentDataResponse.md)\>

Image attachment thumbnail as binary data and the content type

#### Remarks

If the image is smaller than 180x120 then the image is padded.
If the attachment is not an image then a blank image is returned.

#### Example

```typescript
const message = await mailpit.getMessageSummary();
if (message.Attachments.length) {
 const thumbnail = await mailpit.getAttachmentThumbnail(message.ID, message.Attachments[0].PartID);
 // Do something with the thumbnail data
}
```

***

### getChaosTriggers()

> **getChaosTriggers**(): `Promise`\<[`MailpitChaosTriggersResponse`](../interfaces/MailpitChaosTriggersResponse.md)\>

Defined in: [index.ts:959](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L959)

Retrieves the current Chaos triggers configuration (if enabled).

#### Returns

`Promise`\<[`MailpitChaosTriggersResponse`](../interfaces/MailpitChaosTriggersResponse.md)\>

The Chaos triggers configuration

#### Remarks

This will return an error if Chaos is not enabled at runtime.

#### Example

```typescript
const triggers = await mailpit.getChaosTriggers();
```

***

### getConfiguration()

> **getConfiguration**(): `Promise`\<[`MailpitConfigurationResponse`](../interfaces/MailpitConfigurationResponse.md)\>

Defined in: [index.ts:527](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L527)

Retrieves the configuration of the Mailpit web UI.

#### Returns

`Promise`\<[`MailpitConfigurationResponse`](../interfaces/MailpitConfigurationResponse.md)\>

Configuration settings

#### Remarks

Intended for web UI only!

#### Example

```typescript
const config = await mailpit.getConfiguration();
```

***

### getInfo()

> **getInfo**(): `Promise`\<[`MailpitInfoResponse`](../interfaces/MailpitInfoResponse.md)\>

Defined in: [index.ts:512](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L512)

Retrieves information about the Mailpit instance.

#### Returns

`Promise`\<[`MailpitInfoResponse`](../interfaces/MailpitInfoResponse.md)\>

Basic runtime information, message totals and latest release version.

#### Example

```typescript
const info = await mailpit.getInfo();
```

***

### getMessageAttachment()

> **getMessageAttachment**(`id`, `partID`): `Promise`\<[`MailpitAttachmentDataResponse`](../interfaces/MailpitAttachmentDataResponse.md)\>

Defined in: [index.ts:586](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L586)

Retrieves a specific attachment from a message.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | Message database ID or "latest" |
| `partID` | `string` | The attachment part ID |

#### Returns

`Promise`\<[`MailpitAttachmentDataResponse`](../interfaces/MailpitAttachmentDataResponse.md)\>

Attachment as binary data and the content type

#### Example

```typescript
const message = await mailpit.getMessageSummary();
if (message.Attachments.length) {
 const attachment = await mailpit.getMessageAttachment(message.ID, message.Attachments[0].PartID);
 // Do something with the attachment data
}
```

***

### getMessageHeaders()

> **getMessageHeaders**(`id`): `Promise`\<[`MailpitMessageHeadersResponse`](../interfaces/MailpitMessageHeadersResponse.md)\>

Defined in: [index.ts:562](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L562)

Retrieves the headers of a specific message.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `"latest"` | The message database ID. Defaults to `latest` to return the latest message. |

#### Returns

`Promise`\<[`MailpitMessageHeadersResponse`](../interfaces/MailpitMessageHeadersResponse.md)\>

Message headers

#### Remarks

Header keys are returned alphabetically.

#### Example

```typescript
const headers = await mailpit.getMessageHeaders();
```

***

### getMessageSource()

> **getMessageSource**(`id`): `Promise`\<`string`\>

Defined in: [index.ts:651](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L651)

Retrieves the full email message source as plain text.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `"latest"` | The message database ID. Defaults to `latest` to return the latest message. |

#### Returns

`Promise`\<`string`\>

Plain text message source

#### Example

```typescript
const messageSource = await mailpit.getMessageSource();
```

***

### getMessageSummary()

> **getMessageSummary**(`id`): `Promise`\<[`MailpitMessageSummaryResponse`](../interfaces/MailpitMessageSummaryResponse.md)\>

Defined in: [index.ts:542](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L542)

Retrieves a summary of a specific message and marks it as read.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `"latest"` | The message database ID. Defaults to `latest` to return the latest message. |

#### Returns

`Promise`\<[`MailpitMessageSummaryResponse`](../interfaces/MailpitMessageSummaryResponse.md)\>

Message summary

#### Example

```typescript
const message = await mailpit.getMessageSummary();
```

***

### getTags()

> **getTags**(): `Promise`\<`string`[]\>

Defined in: [index.ts:885](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L885)

Retrieves a list of all the unique tags.

#### Returns

`Promise`\<`string`[]\>

All unique message tags

#### Example

```typescript
const tags = await mailpit.getTags();
```

***

### htmlCheck()

> **htmlCheck**(`id`): `Promise`\<[`MailpitHTMLCheckResponse`](../interfaces/MailpitHTMLCheckResponse.md)\>

Defined in: [index.ts:826](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L826)

Performs an HTML check on a specific message.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `"latest"` | The message database ID. Defaults to `latest` to return the latest message. |

#### Returns

`Promise`\<[`MailpitHTMLCheckResponse`](../interfaces/MailpitHTMLCheckResponse.md)\>

The summary of the message HTML checker

#### Example

```typescript
const htmlCheck = await mailpit.htmlCheck();
```

***

### linkCheck()

> **linkCheck**(`id`, `follow`): `Promise`\<[`MailpitLinkCheckResponse`](../interfaces/MailpitLinkCheckResponse.md)\>

Defined in: [index.ts:846](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L846)

Performs a link check on a specific message.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `"latest"` | The message database ID. Defaults to `latest` to return the latest message. |
| `follow` | `"true"` \| `"false"` | `"false"` | Whether to follow links. Defaults to `false`. |

#### Returns

`Promise`\<[`MailpitLinkCheckResponse`](../interfaces/MailpitLinkCheckResponse.md)\>

The summary of the message Link checker.

#### Example

```typescript
const linkCheck = await mailpit.linkCheck();
```

***

### listMessages()

> **listMessages**(`start`, `limit`): `Promise`\<[`MailpitMessagesSummaryResponse`](../interfaces/MailpitMessagesSummaryResponse.md)\>

Defined in: [index.ts:713](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L713)

Retrieves a list of message summaries ordered from newest to oldest.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `start` | `number` | `0` | The pagination offset. Defaults to `0`. |
| `limit` | `number` | `50` | The number of messages to retrieve. Defaults to `50`. |

#### Returns

`Promise`\<[`MailpitMessagesSummaryResponse`](../interfaces/MailpitMessagesSummaryResponse.md)\>

A list of message summaries

#### Remarks

Only contains the number of attachments and a snippet of the message body.

#### See

[getMessageSummary()](MailpitClient.md#getmessagesummary) for more attachment and body details for a specific message.

#### Example

```typescript
const messages = await.listMessages();
```

***

### releaseMessage()

> **releaseMessage**(`id`, `relayTo`): `Promise`\<`string`\>

Defined in: [index.ts:668](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L668)

Release a message via a pre-configured external SMTP server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The message database ID. Use `latest` to return the latest message. |
| `relayTo` | \{ `To`: `string`[]; \} | Array of email addresses to relay the message to |
| `relayTo.To` | `string`[] | - |

#### Returns

`Promise`\<`string`\>

Plain text "ok" response

#### Remarks

This is only enabled if message relaying has been configured.

#### Example

```typescript
const message = await mailpit.releaseMessage("latest", ["user1@example.test", "user2@example.test"]);
```

***

### renameTag()

> **renameTag**(`tag`, `newTagName`): `Promise`\<`string`\>

Defined in: [index.ts:925](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L925)

Renames an existing tag.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tag` | `string` | The current name of the tag. |
| `newTagName` | `string` | A new name for the tag. |

#### Returns

`Promise`\<`string`\>

Plain text "ok" response

#### Remarks

Tags are limited to the following characters: `a-z`, `A-Z`, `0-9`, `-`, `.`, `spaces`, and `_`, and must be a minimum of 1 character.
Other characters are silently stripped from the tag.

#### Example

```typescript
await mailpit.renameTag("Old Tag Name", "New Tag Name");
```

***

### renderMessageHTML()

> **renderMessageHTML**(`id`, `embed`?): `Promise`\<`string`\>

Defined in: [index.ts:1007](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L1007)

Renders the HTML part of a specific message which can be used for UI integration testing.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `"latest"` | The message database ID. Defaults to `latest` to return the latest message. |
| `embed`? | `1` | `undefined` | Whether this route is to be embedded in an iframe. Defaults to `undefined`. Set to `1` to embed. The `embed` parameter will add `target="_blank"` and `rel="noreferrer noopener"` to all links. In addition, a small script will be added to the end of the document to post (postMessage()) the height of the document back to the parent window for optional iframe height resizing. Note that this will also transform the message into a full HTML document (if it isn't already), so this option is useful for viewing but not programmatic testing. |

#### Returns

`Promise`\<`string`\>

Rendered HTML

#### Remarks

Attached inline images are modified to link to the API provided they exist.
If the message does not contain an HTML part then a 404 error is returned.

#### Example

```typescript
const html = await mailpit.renderMessageHTML();
```

***

### renderMessageText()

> **renderMessageText**(`id`): `Promise`\<`string`\>

Defined in: [index.ts:1025](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L1025)

Renders just the message's text part which can be used for UI integration testing.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `"latest"` | The message database ID. Defaults to `latest` to return the latest message. |

#### Returns

`Promise`\<`string`\>

Plain text

#### Example

```typescript
const html = await mailpit.renderMessageText();
```

***

### searchMessages()

> **searchMessages**(`search`): `Promise`\<[`MailpitMessagesSummaryResponse`](../interfaces/MailpitMessagesSummaryResponse.md)\>

Defined in: [index.ts:788](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L788)

Retrieve messages matching a search, sorted by received date (descending).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `search` | [`MailpitSearchMessagesRequest`](../interfaces/MailpitSearchMessagesRequest.md) | The search request containing the query and optional parameters. |

#### Returns

`Promise`\<[`MailpitMessagesSummaryResponse`](../interfaces/MailpitMessagesSummaryResponse.md)\>

A list of message summaries matching the search criteria.

#### See

 - [Search filters](https://mailpit.axllent.org/docs/usage/search-filters/)
 - [getMessageSummary()](MailpitClient.md#getmessagesummary) for more attachment and body details for a specific message.

#### Remarks

Only contains the number of attachments and a snippet of the message body.

#### Example

```typescript
// Search for messages from a the domain example.test
const messages = await mailpit.searchMessages({query: "from:example.test"});
```

***

### sendMessage()

> **sendMessage**(`sendReqest`): `Promise`\<[`MailpitSendMessageConfirmationResponse`](../interfaces/MailpitSendMessageConfirmationResponse.md)\>

Defined in: [index.ts:690](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L690)

Sends a message

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sendReqest` | [`MailpitSendRequest`](../interfaces/MailpitSendRequest.md) | The request containing the message details. |

#### Returns

`Promise`\<[`MailpitSendMessageConfirmationResponse`](../interfaces/MailpitSendMessageConfirmationResponse.md)\>

Response containing database messsage ID

#### Example

```typescript
await mailpit.sendMessage(
 From: { Email: "user@example.test", Name: "First LastName" },
 To: [{ Email: "rec@example.test", Name: "Recipient Name"}, {Email: "another@example.test"}],
 Subject: "Test Email",
);
```

***

### setChaosTriggers()

> **setChaosTriggers**(`triggers`): `Promise`\<[`MailpitChaosTriggersResponse`](../interfaces/MailpitChaosTriggersResponse.md)\>

Defined in: [index.ts:978](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L978)

Sets and/or resets the Chaos triggers configuration (if enabled).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `triggers` | [`MailpitChaosTriggersRequest`](../interfaces/MailpitChaosTriggersRequest.md) | The request containing the chaos triggers. Omitted triggers will reset to the default `0%` probabibility. |

#### Returns

`Promise`\<[`MailpitChaosTriggersResponse`](../interfaces/MailpitChaosTriggersResponse.md)\>

The updated Chaos triggers configuration

#### Remarks

This will return an error if Chaos is not enabled at runtime.

#### Example

```typescript
// Reset all triggers to `0%` probability
const triggers = await mailpit.setChaosTriggers();
// Set `Sender` and reset `Authentication` and `Recipient` triggers
const triggers = await mailpit.setChaosTriggers({ Sender: { ErrorCode: 451, Probability: 5 } });
```

***

### setReadStatus()

> **setReadStatus**(`readStatus`): `Promise`\<`string`\>

Defined in: [index.ts:743](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L743)

Set the read status of messages.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `readStatus` | [`MailpitReadStatusRequest`](../interfaces/MailpitReadStatusRequest.md) | The request containing the message database IDs and read status. |

#### Returns

`Promise`\<`string`\>

Plain text "ok" response

#### Example

```typescript
// Set all messages as unread
await mailpit.setReadStatus();

// Set all messages as read
await mailpit.setReadStatus({ Read: true });

// Set specific messages as read
await mailpit.setReadStatus({ IDs: ["1", "2", "3"], Read: true });
```

***

### setTags()

> **setTags**(`request`): `Promise`\<`string`\>

Defined in: [index.ts:906](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L906)

Sets and removes tag(s) on message(s). This will overwrite any existing tags for selected message database IDs.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `request` | [`MailpitSetTagsRequest`](../interfaces/MailpitSetTagsRequest.md) | The request containing the message IDs and tags. To remove all tags from a message, pass an empty `Tags` array or exclude `Tags` entirely. |

#### Returns

`Promise`\<`string`\>

Plain text "ok" response

#### Remarks

Tags are limited to the following characters: `a-z`, `A-Z`, `0-9`, `-`, `.`, `spaces`, and `_`, and must be a minimum of 1 character.
Other characters are silently stripped from the tag.

#### Example

```typescript
// Set tags on message(s)
await mailpit.setTags({ IDs: ["1", "2", "3"], Tags: ["tag1", "tag2"] });
// Remove tags from message(s)
await mailpit.setTags({ IDs: ["1", "2", "3"]});
```

***

### spamAssassinCheck()

> **spamAssassinCheck**(`id`): `Promise`\<[`MailpitSpamAssassinResponse`](../interfaces/MailpitSpamAssassinResponse.md)\>

Defined in: [index.ts:867](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L867)

Performs a SpamAssassin check (if enabled) on a specific message.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `"latest"` | The message database ID. Defaults to `latest` to return the latest message. |

#### Returns

`Promise`\<[`MailpitSpamAssassinResponse`](../interfaces/MailpitSpamAssassinResponse.md)\>

The SpamAssassin summary (if enabled)

#### Example

```typescript
const spamAssassinCheck = await mailpit.spamAssassinCheck();
```
