# mailpit-api

A NodeJS client library, written in TypeScript, to interact with the Mailpit API.

[![npm version](https://img.shields.io/npm/v/mailpit-api.svg)](https://www.npmjs.com/package/mailpit-api)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

This package provides a convenient way to interact with [Mailpit](https://github.com/axllent/mailpit) from your NodeJS applications.

## Installation

```bash
npm install mailpit-api
```

## Example

```typescript
import { MailpitClient } from "mailpit-api";

// Initialize the API client
const mailpit = new MailpitClient("http://localhost:8025");

// Get all messages
const messages = await mailpit.listMessages();

// Delete all messages
await mailpit.deleteMessages();
```

## Documentation