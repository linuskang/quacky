// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource warmFuzzies', () => {
  smokeCase(
    'warmFuzzies.list:single',
    { operation: 'list', path: '/api/trpc/fuzzies.list' },
    'list',
    async () => {
      await client.warmFuzzies.list();
    },
  );
  smokeCase(
    'warmFuzzies.send:single',
    { operation: 'send', path: '/api/trpc/fuzzies.send' },
    'send',
    async () => {
      await client.warmFuzzies.send({
        receiverId: 'x',
        message: 'x',
      });
    },
  );
  smokeCase(
    'warmFuzzies.report:single',
    { operation: 'report', path: '/api/trpc/fuzzies.report' },
    'report',
    async () => {
      await client.warmFuzzies.report({
        id: 'x',
        reason: 'x',
      });
    },
  );
});
