[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitSpamAssassinResponse

# Interface: MailpitSpamAssassinResponse

Defined in: [index.ts:344](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L344)

Response from the [spamAssassinCheck()](../classes/MailpitClient.md#spamassassincheck) API containing containing SpamAssassin check results.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="errors"></a> `Errors` | `number` | If populated will return an error string | [index.ts:346](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L346) |
| <a id="isspam"></a> `IsSpam` | `boolean` | Whether the message is spam or not | [index.ts:348](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L348) |
| <a id="rules"></a> `Rules` | `object`[] | Spam rules triggered | [index.ts:350](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L350) |
| <a id="score"></a> `Score` | `number` | Total spam score based on triggered rules | [index.ts:359](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L359) |
