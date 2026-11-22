---
name: quacky-t-rpc-api-typescript-sdk
description: "TypeScript SDK for Quacky tRPC API. Use when writing TypeScript code that calls Quacky tRPC API with the @kang-id/quacky-trpc package: installing it, constructing and authenticating the client, and calling API operations."
---

# Quacky tRPC API TypeScript SDK

Generated TypeScript client for Quacky tRPC API, published as `@kang-id/quacky-trpc`. Use the generated client instead of hand-writing HTTP requests.

## Install

```sh
npm install @kang-id/quacky-trpc
```

## Client setup and authentication

```ts
import QuackyTRPCAPI from '@kang-id/quacky-trpc';

const client = new QuackyTRPCAPI();
```

Provide credentials using the options below. Environment variables are read automatically when the target runtime supports them:

- `cookieAuth` (env: `COOKIE_AUTH`) — Better Auth session cookie. The exact cookie prefix may vary by environment.

## Calling operations

```ts
import QuackyTRPCAPI from '@kang-id/quacky-trpc';

const client = new QuackyTRPCAPI();

await client.metaFeeds.list();
```

Method names, parameter shapes, and response types are generated from the API description — do not guess them. Look up the exact call signature in [api.md](./api.md) before writing a call.

## Error handling

Non-success responses throw generated API errors. Error objects expose status, headers, response body, and request metadata where the target runtime supports it.

```ts
import { APIError } from '@kang-id/quacky-trpc';

try {
  await client.metaFeeds.list();
} catch (err) {
  if (err instanceof APIError) {
    console.log(err.status, err.name, err.headers);
  }
  throw err;
}
```

## Requirements

- Node.js 20+, a modern browser, or any runtime with `fetch` support

## Reference files

- [README.md](./README.md) — full feature tour: client options, request options, retries and timeouts, logging.
- [api.md](./api.md) — complete catalogue of every operation with request and response types.
