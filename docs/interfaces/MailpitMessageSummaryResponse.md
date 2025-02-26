[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitMessageSummaryResponse

# Interface: MailpitMessageSummaryResponse

Defined in: [index.ts:138](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L138)

Response for the [getMessageSummary()](../classes/MailpitClient.md#getmessagesummary) API containing the summary of a message

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attachments"></a> `Attachments` | [`MailpitAttachmentResponse`](MailpitAttachmentResponse.md)[] | Message Attachmets | [index.ts:140](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L140) |
| <a id="bcc"></a> `Bcc` | [`MailpitEmailAddressResponse`](MailpitEmailAddressResponse.md)[] | BCC addresses | [index.ts:142](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L142) |
| <a id="cc"></a> `Cc` | [`MailpitEmailAddressResponse`](MailpitEmailAddressResponse.md)[] | CC addresses | [index.ts:144](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L144) |
| <a id="date"></a> `Date` | `string` | Message date if set, else date received. In ISO format: 1970-01-01T00:00:00.000Z | [index.ts:146](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L146) |
| <a id="from"></a> `From` | [`MailpitEmailAddressResponse`](MailpitEmailAddressResponse.md) | sender address | [index.ts:148](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L148) |
| <a id="html"></a> `HTML` | `string` | Message body HTML | [index.ts:150](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L150) |
| <a id="id"></a> `ID` | `string` | Database ID | [index.ts:152](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L152) |
| <a id="inline"></a> `Inline` | [`MailpitEmailAddressResponse`](MailpitEmailAddressResponse.md)[] | Inline message attachements | [index.ts:154](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L154) |
| <a id="messageid"></a> `MessageID` | `string` | Message ID | [index.ts:156](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L156) |
| <a id="replyto"></a> `ReplyTo` | [`MailpitEmailAddressResponse`](MailpitEmailAddressResponse.md)[] | ReplyTo addresses | [index.ts:158](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L158) |
| <a id="returnpath"></a> `ReturnPath` | `string` | Return-Path | [index.ts:160](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L160) |
| <a id="size"></a> `Size` | `number` | Message size in bytes | [index.ts:162](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L162) |
| <a id="subject"></a> `Subject` | `string` | Message subject | [index.ts:164](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L164) |
| <a id="tags"></a> `Tags` | `string`[] | Messages tags | [index.ts:166](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L166) |
| <a id="text"></a> `Text` | `string` | Message body text | [index.ts:168](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L168) |
| <a id="to"></a> `To` | [`MailpitEmailAddressResponse`](MailpitEmailAddressResponse.md)[] | To addresses | [index.ts:170](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L170) |
