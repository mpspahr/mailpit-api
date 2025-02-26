[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitInfoResponse

# Interface: MailpitInfoResponse

Defined in: [index.ts:74](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L74)

Response for the [getInfo()](../classes/MailpitClient.md#getinfo) API containing information about the Mailpit instance.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="database"></a> `Database` | `string` | Database path | [index.ts:76](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L76) |
| <a id="databasesize"></a> `DatabaseSize` | `number` | Datacase size in bytes | [index.ts:78](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L78) |
| <a id="latestversion"></a> `LatestVersion` | `string` | Latest Mailpit version | [index.ts:80](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L80) |
| <a id="messages"></a> `Messages` | `number` | Total number of messages in the database | [index.ts:82](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L82) |
| <a id="runtimestats"></a> `RuntimeStats` | `object` | Runtime statistics | [index.ts:84](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L84) |
| `RuntimeStats.Memory` | `number` | Current memory usage in bytes | [index.ts:86](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L86) |
| `RuntimeStats.MessagesDeleted` | `number` | Database runtime messages deleted | [index.ts:88](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L88) |
| `RuntimeStats.SMTPAccepted` | `number` | Accepted runtime SMTP messages | [index.ts:90](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L90) |
| `RuntimeStats.SMTPAcceptedSize` | `number` | Total runtime accepted messages size in bytes | [index.ts:92](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L92) |
| `RuntimeStats.SMTPIgnored` | `number` | Ignored runtime SMTP messages (when using --ignore-duplicate-ids) | [index.ts:94](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L94) |
| `RuntimeStats.SMTPRejected` | `number` | Rejected runtime SMTP messages | [index.ts:96](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L96) |
| `RuntimeStats.Uptime` | `number` | Mailpit server uptime in seconds | [index.ts:98](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L98) |
| <a id="tags"></a> `Tags` | `object` | Tag information | [index.ts:101](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L101) |
| <a id="unread"></a> `Unread` | `number` | Total number of messages in the database | [index.ts:106](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L106) |
| <a id="version"></a> `Version` | `string` | Current Mailpit version | [index.ts:108](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L108) |
