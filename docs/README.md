**mailpit-api**

***

# mailpit-api

## Classes

| Class | Description |
| ------ | ------ |
| [MailpitClient](classes/MailpitClient.md) | Client for interacting with the [Mailpit API](https://mailpit.axllent.org/docs/api-v1/). |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [MailpitAttachmentDataResponse](interfaces/MailpitAttachmentDataResponse.md) | Response for the [getMessageAttachment()](classes/MailpitClient.md#getmessageattachment) and [getAttachmentThumbnail()](classes/MailpitClient.md#getattachmentthumbnail) APIs containing attachment data |
| [MailpitAttachmentRequest](interfaces/MailpitAttachmentRequest.md) | Represents an attachment for a request. |
| [MailpitAttachmentResponse](interfaces/MailpitAttachmentResponse.md) | Represents an attachment from a response. |
| [MailpitChaosTrigger](interfaces/MailpitChaosTrigger.md) | Represents information about a Chaos trigger |
| [MailpitChaosTriggersRequest](interfaces/MailpitChaosTriggersRequest.md) | Request parameters for the [setChaosTriggers()](classes/MailpitClient.md#setchaostriggers) API. |
| [MailpitChaosTriggersResponse](interfaces/MailpitChaosTriggersResponse.md) | Response for the [setChaosTriggers()](classes/MailpitClient.md#setchaostriggers) and [getChaosTriggers()](classes/MailpitClient.md#getchaostriggers) APIs containing the current chaos triggers. |
| [MailpitConfigurationResponse](interfaces/MailpitConfigurationResponse.md) | Response for the [getConfiguraton()](classes/MailpitClient.md#getconfiguration) API containing configuration for the Mailpit web UI. |
| [MailpitDatabaseIDsRequest](interfaces/MailpitDatabaseIDsRequest.md) | Common request parameters for APIs requiring a list of message database IDs |
| [MailpitEmailAddressRequest](interfaces/MailpitEmailAddressRequest.md) | Represents a name and email address for a request. |
| [MailpitEmailAddressResponse](interfaces/MailpitEmailAddressResponse.md) | Represents a name and email address from a response. |
| [MailpitHTMLCheckResponse](interfaces/MailpitHTMLCheckResponse.md) | Response from the [htmlCheck()](classes/MailpitClient.md#htmlcheck) API containing HTML check results. |
| [MailpitInfoResponse](interfaces/MailpitInfoResponse.md) | Response for the [getInfo()](classes/MailpitClient.md#getinfo) API containing information about the Mailpit instance. |
| [MailpitLinkCheckResponse](interfaces/MailpitLinkCheckResponse.md) | Response from the [linkCheck()](classes/MailpitClient.md#linkcheck) API containing link check results. |
| [MailpitMessageHeadersResponse](interfaces/MailpitMessageHeadersResponse.md) | Response for the [getMessageHeaders()](classes/MailpitClient.md#getmessageheaders) API containing message headers |
| [MailpitMessagesSummaryResponse](interfaces/MailpitMessagesSummaryResponse.md) | Response for the [listMessages()](classes/MailpitClient.md#listmessages) API containing the summary of multiple messages. |
| [MailpitMessageSummaryResponse](interfaces/MailpitMessageSummaryResponse.md) | Response for the [getMessageSummary()](classes/MailpitClient.md#getmessagesummary) API containing the summary of a message |
| [MailpitReadStatusRequest](interfaces/MailpitReadStatusRequest.md) | Request parameters for the [setReadStatus()](classes/MailpitClient.md#setreadstatus) API. |
| [MailpitSearchMessagesRequest](interfaces/MailpitSearchMessagesRequest.md) | Request parameters for the [searchMessages()](classes/MailpitClient.md#searchmessages) API. |
| [MailpitSearchRequest](interfaces/MailpitSearchRequest.md) | Common request parameters for APIs with a search query |
| [MailpitSendMessageConfirmationResponse](interfaces/MailpitSendMessageConfirmationResponse.md) | Response for the [sendMessage()](classes/MailpitClient.md#sendmessage) API containing confirmation identifier. |
| [MailpitSendRequest](interfaces/MailpitSendRequest.md) | Request parameters for the [sendMessage()](classes/MailpitClient.md#sendmessage) API. |
| [MailpitSetTagsRequest](interfaces/MailpitSetTagsRequest.md) | Request parameters for the [setTags()](classes/MailpitClient.md#settags) API. |
| [MailpitSpamAssassinResponse](interfaces/MailpitSpamAssassinResponse.md) | Response from the [spamAssassinCheck()](classes/MailpitClient.md#spamassassincheck) API containing containing SpamAssassin check results. |
