[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitAttachmentRequest

# Interface: MailpitAttachmentRequest

Defined in: [index.ts:25](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L25)

Represents an attachment for a request.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="content"></a> `Content` | `string` | Base64-encoded string for the file content | [index.ts:27](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L27) |
| <a id="contentid"></a> `ContentID?` | `string` | Optional Content-ID (cid) for attachment. If this field is set then the file is attached inline. | [index.ts:29](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L29) |
| <a id="contenttype"></a> `ContentType?` | `string` | Optional Content Type for the the attachment. If this field is not set (or empty) then the content type is automatically detected. | [index.ts:31](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L31) |
| <a id="filename"></a> `Filename` | `string` | Filename for the attachement | [index.ts:33](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L33) |
