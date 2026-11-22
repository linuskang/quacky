// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource quizzes', () => {
  smokeCase('quizzes.list:single', { operation: 'list', path: '/api/trpc/quiz.list' }, 'list', async () => {
    await client.quizzes.list();
  });
  smokeCase(
    'quizzes.slug:required',
    { operation: 'slug', path: '/api/trpc/quiz.bySlug' },
    'slug: only required params',
    async () => {
      await client.quizzes.slug();
    },
  );
  smokeCase(
    'quizzes.slug:all',
    { operation: 'slug', path: '/api/trpc/quiz.bySlug' },
    'slug: required and optional params',
    async () => {
      await client.quizzes.slug({
        input: 'input',
      });
    },
  );
  smokeCase(
    'quizzes.submit:single',
    { operation: 'submit', path: '/api/trpc/quiz.submit' },
    'submit',
    async () => {
      await client.quizzes.submit({
        id: 'x',
        answers: {},
      });
    },
  );
});
