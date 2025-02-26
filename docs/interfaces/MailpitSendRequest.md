[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitSendRequest

# Interface: MailpitSendRequest

Defined in: [index.ts:225](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L225)

Request parameters for the [sendMessage()](../classes/MailpitClient.md#sendmessage) API.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attachments"></a> `Attachments?` | [`MailpitAttachmentRequest`](MailpitAttachmentRequest.md)[] | Attachments | [index.ts:227](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L227) |
| <a id="bcc"></a> `Bcc?` | `string`[] | Bcc recipients email addresses only | [index.ts:229](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L229) |
| <a id="cc"></a> `Cc?` | [`MailpitEmailAddressRequest`](MailpitEmailAddressRequest.md)[] | CC recipients | [index.ts:231](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L231) |
| <a id="from"></a> `From` | [`MailpitEmailAddressRequest`](MailpitEmailAddressRequest.md) | Sender address | [index.ts:233](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L233) |
| <a id="headers"></a> `Headers?` | `object` | Optional message headers | [index.ts:237](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L237) |
| <a id="html"></a> `HTML?` | `string` | Message body (HTML) | [index.ts:235](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L235) |
| <a id="replyto"></a> `ReplyTo?` | [`MailpitEmailAddressRequest`](MailpitEmailAddressRequest.md)[] | Optional Reply-To recipients | [index.ts:242](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L242) |
| <a id="subject"></a> `Subject?` | `string` | Email message subject | [index.ts:244](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L244) |
| <a id="tags"></a> `Tags?` | `string`[] | Mailpit tags | [index.ts:246](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L246) |
| <a id="text"></a> `Text?` | `string` | Message body (text) | [index.ts:248](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L248) |
| <a id="to"></a> `To` | [`MailpitEmailAddressRequest`](MailpitEmailAddressRequest.md)[] | To recipients | [index.ts:250](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L250) |
