[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitChaosTrigger

# Interface: MailpitChaosTrigger

Defined in: [index.ts:51](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L51)

Represents information about a Chaos trigger

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="errorcode"></a> `ErrorCode` | `number` | SMTP error code to return. The value must range from 400 to 599. | [index.ts:53](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L53) |
| <a id="probability"></a> `Probability` | `number` | Probability (chance) of triggering the error. The value must range from 0 to 100. | [index.ts:55](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L55) |
