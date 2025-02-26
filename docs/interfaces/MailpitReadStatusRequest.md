[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitReadStatusRequest

# Interface: MailpitReadStatusRequest

Defined in: [index.ts:363](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L363)

Request parameters for the [setReadStatus()](../classes/MailpitClient.md#setreadstatus) API.

## Extends

- [`MailpitDatabaseIDsRequest`](MailpitDatabaseIDsRequest.md)

## Properties

| Property | Type | Default value | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="ids"></a> `IDs?` | `string`[] | `undefined` | Array of message database IDs | [`MailpitDatabaseIDsRequest`](MailpitDatabaseIDsRequest.md).[`IDs`](MailpitDatabaseIDsRequest.md#ids) | [index.ts:69](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L69) |
| <a id="read"></a> `Read?` | `boolean` | `false` | Read status | - | [index.ts:368](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L368) |
