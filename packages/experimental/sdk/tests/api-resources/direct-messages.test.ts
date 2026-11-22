// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource directMessages', () => {
  smokeCase(
    'directMessages.conversations:single',
    { operation: 'conversations', path: '/api/trpc/dms.conversations' },
    'conversations',
    async () => {
      await client.directMessages.conversations();
    },
  );
  smokeCase(
    'directMessages.list:required',
    { operation: 'list', path: '/api/trpc/dms.messages' },
    'list: only required params',
    async () => {
      await client.directMessages.list();
    },
  );
  smokeCase(
    'directMessages.list:all',
    { operation: 'list', path: '/api/trpc/dms.messages' },
    'list: required and optional params',
    async () => {
      await client.directMessages.list({
        input: 'input',
      });
    },
  );
  smokeCase(
    'directMessages.send:single',
    { operation: 'send', path: '/api/trpc/dms.send' },
    'send',
    async () => {
      await client.directMessages.send({
        handle: 'x',
        message: 'x',
      });
    },
  );
});
