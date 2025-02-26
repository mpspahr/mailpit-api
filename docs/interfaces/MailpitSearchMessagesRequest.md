[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitSearchMessagesRequest

# Interface: MailpitSearchMessagesRequest

Defined in: [index.ts:372](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L372)

Request parameters for the [searchMessages()](../classes/MailpitClient.md#searchmessages) API.

## Extends

- [`MailpitSearchRequest`](MailpitSearchRequest.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="limit"></a> `limit?` | `number` | Limit results | - | [index.ts:376](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L376) |
| <a id="query"></a> `query` | `string` | [Search query](https://mailpit.axllent.org/docs/usage/search-filters/) | [`MailpitSearchRequest`](MailpitSearchRequest.md).[`query`](MailpitSearchRequest.md#query) | [index.ts:61](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L61) |
| <a id="start"></a> `start?` | `number` | Pagination offset | - | [index.ts:374](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L374) |
| <a id="tz"></a> `tz?` | `string` | [Timezone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) used only for `before:` & `after:` searches (eg: "Pacific/Auckland"). | [`MailpitSearchRequest`](MailpitSearchRequest.md).[`tz`](MailpitSearchRequest.md#tz) | [index.ts:63](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L63) |
