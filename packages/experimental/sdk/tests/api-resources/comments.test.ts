// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource comments', () => {
  smokeCase(
    'comments.id:required',
    { operation: 'id', path: '/api/trpc/comments.byId' },
    'id: only required params',
    async () => {
      await client.comments.id();
    },
  );
  smokeCase(
    'comments.id:all',
    { operation: 'id', path: '/api/trpc/comments.byId' },
    'id: required and optional params',
    async () => {
      await client.comments.id({
        input: 'input',
      });
    },
  );
  smokeCase(
    'comments.create:single',
    { operation: 'create', path: '/api/trpc/comments.create' },
    'create',
    async () => {
      await client.comments.create({
        postId: 'x',
        content: 'x',
      });
    },
  );
  smokeCase(
    'comments.delete:single',
    { operation: 'delete', path: '/api/trpc/comments.delete' },
    'delete',
    async () => {
      await client.comments.delete({
        id: 'x',
      });
    },
  );
  smokeCase(
    'comments.report:single',
    { operation: 'report', path: '/api/trpc/comments.report' },
    'report',
    async () => {
      await client.comments.report({
        id: 'x',
        reason: 'x',
      });
    },
  );
});
