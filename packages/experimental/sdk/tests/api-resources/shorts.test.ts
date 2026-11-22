// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource shorts', () => {
  smokeCase('shorts.list:single', { operation: 'list', path: '/api/trpc/shorts.list' }, 'list', async () => {
    await client.shorts.list();
  });
  smokeCase(
    'shorts.id:required',
    { operation: 'id', path: '/api/trpc/shorts.byId' },
    'id: only required params',
    async () => {
      await client.shorts.id();
    },
  );
  smokeCase(
    'shorts.id:all',
    { operation: 'id', path: '/api/trpc/shorts.byId' },
    'id: required and optional params',
    async () => {
      await client.shorts.id({
        input: 'input',
      });
    },
  );
  smokeCase(
    'shorts.create:single',
    { operation: 'create', path: '/api/trpc/shorts.create' },
    'create',
    async () => {
      await client.shorts.create({});
    },
  );
  smokeCase(
    'shorts.report:single',
    { operation: 'report', path: '/api/trpc/shorts.report' },
    'report',
    async () => {
      await client.shorts.report({
        id: 'x',
        reason: 'x',
      });
    },
  );
});
