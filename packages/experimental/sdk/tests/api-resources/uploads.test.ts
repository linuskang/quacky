// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource uploads', () => {
  smokeCase(
    'uploads.uploadFile:single',
    { operation: 'uploadFile', path: '/api/trpc/upload.file' },
    'uploadFile',
    async () => {
      await client.uploads.uploadFile({});
    },
  );
});
