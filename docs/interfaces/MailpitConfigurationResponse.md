[**mailpit-api**](../README.md)

***

[mailpit-api](../README.md) / MailpitConfigurationResponse

# Interface: MailpitConfigurationResponse

Defined in: [index.ts:112](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L112)

Response for the [getConfiguraton()](../classes/MailpitClient.md#getconfiguration) API containing configuration for the Mailpit web UI.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="chaosenabled"></a> `ChaosEnabled` | `boolean` | Whether Chaos support is enabled at runtime | [index.ts:114](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L114) |
| <a id="duplicatesignored"></a> `DuplicatesIgnored` | `boolean` | Whether messages with duplicate IDs are ignored | [index.ts:116](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L116) |
| <a id="label"></a> `Label` | `string` | Label to identify this Mailpit instance | [index.ts:118](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L118) |
| <a id="messagerelay"></a> `MessageRelay` | `object` | - | [index.ts:119](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L119) |
| `MessageRelay.AllowedRecipients` | `string` | Only allow relaying to these recipients (regex) | [index.ts:121](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L121) |
| `MessageRelay.BlockedRecipients` | `string` | Block relaying to these recipients (regex) | [index.ts:123](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L123) |
| `MessageRelay.Enabled` | `boolean` | Whether message relaying (release) is enabled | [index.ts:125](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L125) |
| `MessageRelay.OverrideFrom` | `string` | Overrides the "From" address for all relayed messages | [index.ts:127](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L127) |
| `MessageRelay.ReturnPath` | `string` | Enforced Return-Path (if set) for relay bounces | [index.ts:129](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L129) |
| `MessageRelay.SMTPServer` | `string` | The configured SMTP server address | [index.ts:131](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L131) |
| <a id="spamassassin"></a> `SpamAssassin` | `boolean` | Whether SpamAssassin is enabled | [index.ts:134](https://github.com/mpspahr/mailpit-api/blob/861dbfe89d38290995a3d1499878fc8416408e21/src/index.ts#L134) |
