[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitMessagesSummaryResponse

# Interface: MailpitMessagesSummaryResponse

Defined in: [index.ts:174](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L174)

Response for the [listMessages()](../classes/MailpitClient.md#listmessages) API containing the summary of multiple messages.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="messages"></a> `messages` | `object`[] | Messages | [index.ts:176](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L176) |
| <a id="messages_count"></a> `messages_count` | `number` | Total number of messages matching the current query | [index.ts:207](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L207) |
| <a id="start"></a> `start` | `number` | Pagination offset | [index.ts:209](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L209) |
| <a id="tags"></a> `tags` | `string`[] | All current tags | [index.ts:211](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L211) |
| <a id="total"></a> `total` | `number` | Total number of messages in mailbox | [index.ts:213](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L213) |
| <a id="unread"></a> `unread` | `number` | Total number of unread messages in mailbox | [index.ts:215](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L215) |
