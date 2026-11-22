// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource dailyRng', () => {
  smokeCase('dailyRng.mine:single', { operation: 'mine', path: '/api/trpc/rng.mine' }, 'mine', async () => {
    await client.dailyRng.mine();
  });
  smokeCase(
    'dailyRng.today:single',
    { operation: 'today', path: '/api/trpc/rng.today' },
    'today',
    async () => {
      await client.dailyRng.today();
    },
  );
  smokeCase('dailyRng.roll:single', { operation: 'roll', path: '/api/trpc/rng.roll' }, 'roll', async () => {
    await client.dailyRng.roll();
  });
});
