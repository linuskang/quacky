// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource metaFeeds', () => {
  smokeCase('metaFeeds.list:single', { operation: 'list', path: '/api/trpc/meta.get' }, 'list', async () => {
    await client.metaFeeds.list();
  });
  smokeCase(
    'metaFeeds.trending:single',
    { operation: 'trending', path: '/api/trpc/meta.trending' },
    'trending',
    async () => {
      await client.metaFeeds.trending();
    },
  );
  smokeCase('metaFeeds.news:single', { operation: 'news', path: '/api/trpc/meta.news' }, 'news', async () => {
    await client.metaFeeds.news();
  });
  smokeCase(
    'metaFeeds.leaderboard:single',
    { operation: 'leaderboard', path: '/api/trpc/meta.leaderboard' },
    'leaderboard',
    async () => {
      await client.metaFeeds.leaderboard();
    },
  );
  smokeCase(
    'metaFeeds.feedback:single',
    { operation: 'feedback', path: '/api/trpc/meta.feedback' },
    'feedback',
    async () => {
      await client.metaFeeds.feedback({
        usability: 1,
        satisfaction: 1,
        recommend: 1,
        visual: 1,
        comments: 'x',
      });
    },
  );
});
