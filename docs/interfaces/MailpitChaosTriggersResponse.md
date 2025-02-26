[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitChaosTriggersResponse

# Interface: MailpitChaosTriggersResponse

Defined in: [index.ts:398](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L398)

Response for the [setChaosTriggers()](../classes/MailpitClient.md#setchaostriggers) and [getChaosTriggers()](../classes/MailpitClient.md#getchaostriggers) APIs containing the current chaos triggers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="authentication"></a> `Authentication` | [`MailpitChaosTrigger`](MailpitChaosTrigger.md) | Authentication trigger for Chaos | [index.ts:400](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L400) |
| <a id="recipient"></a> `Recipient` | [`MailpitChaosTrigger`](MailpitChaosTrigger.md) | Recipient trigger for Chaos | [index.ts:402](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L402) |
| <a id="sender"></a> `Sender` | [`MailpitChaosTrigger`](MailpitChaosTrigger.md) | Sender trigger for Chaos | [index.ts:404](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L404) |
