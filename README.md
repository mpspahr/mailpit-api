# Mailpit API and WebSocket Clients

[![Package Version](https://img.shields.io/npm/v/mailpit-api.svg?label=mailpit-api)](https://www.npmjs.com/package/mailpit-api)
[![Package Version](https://img.shields.io/npm/v/mailpit-ws.svg?label=mailpit-ws)](https://www.npmjs.com/package/mailpit-ws)
[![Test Suite](https://github.com/mpspahr/mailpit-api/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/mpspahr/mailpit-api/actions/workflows/test.yml)
[![Code Coverage](https://codecov.io/gh/mpspahr/mailpit-api/graph/badge.svg?token=VUWKIYK1WM)](https://codecov.io/gh/mpspahr/mailpit-api)
[![Documentation](https://github.com/mpspahr/mailpit-api/actions/workflows/deploy-docs.yml/badge.svg?branch=main&label=docs)](https://mpspahr.github.io/mailpit-api/)

TypeScript clients for interacting with [Mailpit](https://mailpit.axllent.org/). Ideal for automating your email testing. Works in **Node.js, browser, and any modern JS runtime**.

## Packages

| Package                                                                                | Description                           | Docs                                                                            |
| -------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| [`mailpit-api`](https://github.com/mpspahr/mailpit-api/tree/main/packages/mailpit-api) | REST API client - zero dependencies   | [API Reference](https://mpspahr.github.io/mailpit-api/modules/mailpit-api.html) |
| [`mailpit-ws`](https://github.com/mpspahr/mailpit-api/tree/main/packages/mailpit-ws)   | WebSocket client for real-time events | [API Reference](https://mpspahr.github.io/mailpit-api/modules/mailpit-ws.html)  |

## Quick Start

```bash
# REST API only (zero dependencies)
npm install mailpit-api

# REST API + real-time events
npm install mailpit-api mailpit-ws
```

## Documentation

[Detailed documentation](https://mpspahr.github.io/mailpit-api/) covering all available methods and type definitions for both packages.

Upgrading from v1? See the [upgrade guide](./UPGRADING.md).
