[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitAttachmentDataResponse

# Interface: MailpitAttachmentDataResponse

Defined in: [index.ts:408](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L408)

Response for the [getMessageAttachment()](../classes/MailpitClient.md#getmessageattachment) and [getAttachmentThumbnail()](../classes/MailpitClient.md#getattachmentthumbnail) APIs containing attachment data

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="data"></a> `data` | `ArrayBuffer` | The attachment binary data | [index.ts:410](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L410) |
| <a id="type"></a> `type` | `string` | The attachment MIME type | [index.ts:412](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L412) |
