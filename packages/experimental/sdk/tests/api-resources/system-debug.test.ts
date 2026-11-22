// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource systemDebug', () => {
  smokeCase(
    'systemDebug.list:single',
    { operation: 'list', path: '/api/trpc/system.debug' },
    'list',
    async () => {
      await client.systemDebug.list();
    },
  );
  smokeCase(
    'systemDebug.testPush:single',
    { operation: 'testPush', path: '/api/trpc/system.testPush' },
    'testPush',
    async () => {
      await client.systemDebug.testPush();
    },
  );
  smokeCase(
    'systemDebug.test:single',
    { operation: 'test', path: '/api/trpc/system.test' },
    'test',
    async () => {
      await client.systemDebug.test();
    },
  );
});
