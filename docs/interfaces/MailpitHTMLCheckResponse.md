[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitHTMLCheckResponse

# Interface: MailpitHTMLCheckResponse

Defined in: [index.ts:260](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L260)

Response from the [htmlCheck()](../classes/MailpitClient.md#htmlcheck) API containing HTML check results.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="platforms"></a> `Platforms` | `object` | All platforms tested, mainly for the web UI | [index.ts:262](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L262) |
| <a id="total"></a> `Total` | `object` | Total weighted result for all scores | [index.ts:266](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L266) |
| `Total.Nodes` | `number` | Total number of HTML nodes detected in message | [index.ts:268](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L268) |
| `Total.Partial` | `number` | Overall percentage partially supported | [index.ts:270](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L270) |
| `Total.Supported` | `number` | Overall percentage supported | [index.ts:272](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L272) |
| `Total.Tests` | `number` | Total number of tests done | [index.ts:274](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L274) |
| `Total.Unsupported` | `number` | Overall percentage unsupported | [index.ts:276](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L276) |
| <a id="warnings"></a> `Warnings` | `object`[] | List of warnings from tests | [index.ts:279](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L279) |
