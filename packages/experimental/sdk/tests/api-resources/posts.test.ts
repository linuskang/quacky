// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource posts', () => {
  smokeCase(
    'posts.feed:required',
    { operation: 'feed', path: '/api/trpc/posts.feed' },
    'feed: only required params',
    async () => {
      await client.posts.feed();
    },
  );
  smokeCase(
    'posts.feed:all',
    { operation: 'feed', path: '/api/trpc/posts.feed' },
    'feed: required and optional params',
    async () => {
      await client.posts.feed({
        input: 'input',
      });
    },
  );
  smokeCase(
    'posts.id:required',
    { operation: 'id', path: '/api/trpc/posts.byId' },
    'id: only required params',
    async () => {
      await client.posts.id();
    },
  );
  smokeCase(
    'posts.id:all',
    { operation: 'id', path: '/api/trpc/posts.byId' },
    'id: required and optional params',
    async () => {
      await client.posts.id({
        input: 'input',
      });
    },
  );
  smokeCase(
    'posts.create:single',
    { operation: 'create', path: '/api/trpc/posts.create' },
    'create',
    async () => {
      await client.posts.create({
        content: 'x',
        attachments: [],
      });
    },
  );
  smokeCase(
    'posts.update:single',
    { operation: 'update', path: '/api/trpc/posts.update' },
    'update',
    async () => {
      await client.posts.update({
        id: 'x',
        content: 'x',
      });
    },
  );
  smokeCase(
    'posts.delete:single',
    { operation: 'delete', path: '/api/trpc/posts.delete' },
    'delete',
    async () => {
      await client.posts.delete({
        id: 'x',
      });
    },
  );
  smokeCase('posts.like:single', { operation: 'like', path: '/api/trpc/posts.like' }, 'like', async () => {
    await client.posts.like({
      id: 'x',
    });
  });
  smokeCase(
    'posts.unlike:single',
    { operation: 'unlike', path: '/api/trpc/posts.unlike' },
    'unlike',
    async () => {
      await client.posts.unlike({
        id: 'x',
      });
    },
  );
  smokeCase(
    'posts.bookmark:single',
    { operation: 'bookmark', path: '/api/trpc/posts.bookmark' },
    'bookmark',
    async () => {
      await client.posts.bookmark({
        id: 'x',
      });
    },
  );
  smokeCase(
    'posts.unbookmark:single',
    { operation: 'unbookmark', path: '/api/trpc/posts.unbookmark' },
    'unbookmark',
    async () => {
      await client.posts.unbookmark({
        id: 'x',
      });
    },
  );
  smokeCase(
    'posts.repost:single',
    { operation: 'repost', path: '/api/trpc/posts.repost' },
    'repost',
    async () => {
      await client.posts.repost({
        postId: 'x',
      });
    },
  );
  smokeCase(
    'posts.quote:single',
    { operation: 'quote', path: '/api/trpc/posts.quote' },
    'quote',
    async () => {
      await client.posts.quote({
        postId: 'x',
        content: 'x',
      });
    },
  );
  smokeCase(
    'posts.report:single',
    { operation: 'report', path: '/api/trpc/posts.report' },
    'report',
    async () => {
      await client.posts.report({
        id: 'x',
        reason: 'x',
      });
    },
  );
});
