// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource memeland', () => {
  smokeCase('memeland.list:single', { operation: 'list', path: '/api/trpc/memes.list' }, 'list', async () => {
    await client.memeland.list();
  });
  smokeCase(
    'memeland.id:required',
    { operation: 'id', path: '/api/trpc/memes.byId' },
    'id: only required params',
    async () => {
      await client.memeland.id();
    },
  );
  smokeCase(
    'memeland.id:all',
    { operation: 'id', path: '/api/trpc/memes.byId' },
    'id: required and optional params',
    async () => {
      await client.memeland.id({
        input: 'input',
      });
    },
  );
  smokeCase(
    'memeland.create:single',
    { operation: 'create', path: '/api/trpc/memes.create' },
    'create',
    async () => {
      await client.memeland.create({
        image: 'x',
      });
    },
  );
  smokeCase('memeland.vote:single', { operation: 'vote', path: '/api/trpc/memes.vote' }, 'vote', async () => {
    await client.memeland.vote({
      id: 'x',
      type: 'UPVOTE',
    });
  });
  smokeCase(
    'memeland.report:single',
    { operation: 'report', path: '/api/trpc/memes.report' },
    'report',
    async () => {
      await client.memeland.report({
        id: 'x',
        reason: 'x',
      });
    },
  );
});
