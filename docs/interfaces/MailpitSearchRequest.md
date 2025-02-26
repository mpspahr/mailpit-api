[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitSearchRequest

# Interface: MailpitSearchRequest

Defined in: [index.ts:59](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L59)

Common request parameters for APIs with a search query

## Extended by

- [`MailpitSearchMessagesRequest`](MailpitSearchMessagesRequest.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="query"></a> `query` | `string` | [Search query](https://mailpit.axllent.org/docs/usage/search-filters/) | [index.ts:61](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L61) |
| <a id="tz"></a> `tz?` | `string` | [Timezone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) used only for `before:` & `after:` searches (eg: "Pacific/Auckland"). | [index.ts:63](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L63) |
