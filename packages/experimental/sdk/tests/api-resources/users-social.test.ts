// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource usersSocial', () => {
  smokeCase(
    'usersSocial.handle:required',
    { operation: 'handle', path: '/api/trpc/users.byHandle' },
    'handle: only required params',
    async () => {
      await client.usersSocial.handle();
    },
  );
  smokeCase(
    'usersSocial.handle:all',
    { operation: 'handle', path: '/api/trpc/users.byHandle' },
    'handle: required and optional params',
    async () => {
      await client.usersSocial.handle({
        input: 'input',
      });
    },
  );
  smokeCase(
    'usersSocial.mentions:required',
    { operation: 'mentions', path: '/api/trpc/users.mentions' },
    'mentions: only required params',
    async () => {
      await client.usersSocial.mentions();
    },
  );
  smokeCase(
    'usersSocial.mentions:all',
    { operation: 'mentions', path: '/api/trpc/users.mentions' },
    'mentions: required and optional params',
    async () => {
      await client.usersSocial.mentions({
        input: 'input',
      });
    },
  );
  smokeCase(
    'usersSocial.suggested:single',
    { operation: 'suggested', path: '/api/trpc/users.suggested' },
    'suggested',
    async () => {
      await client.usersSocial.suggested();
    },
  );
  smokeCase(
    'usersSocial.followers:required',
    { operation: 'followers', path: '/api/trpc/users.followers' },
    'followers: only required params',
    async () => {
      await client.usersSocial.followers();
    },
  );
  smokeCase(
    'usersSocial.followers:all',
    { operation: 'followers', path: '/api/trpc/users.followers' },
    'followers: required and optional params',
    async () => {
      await client.usersSocial.followers({
        input: 'input',
      });
    },
  );
  smokeCase(
    'usersSocial.following:required',
    { operation: 'following', path: '/api/trpc/users.following' },
    'following: only required params',
    async () => {
      await client.usersSocial.following();
    },
  );
  smokeCase(
    'usersSocial.following:all',
    { operation: 'following', path: '/api/trpc/users.following' },
    'following: required and optional params',
    async () => {
      await client.usersSocial.following({
        input: 'input',
      });
    },
  );
  smokeCase(
    'usersSocial.follow:single',
    { operation: 'follow', path: '/api/trpc/users.follow' },
    'follow',
    async () => {
      await client.usersSocial.follow({
        handle: 'x',
      });
    },
  );
  smokeCase(
    'usersSocial.unfollow:single',
    { operation: 'unfollow', path: '/api/trpc/users.unfollow' },
    'unfollow',
    async () => {
      await client.usersSocial.unfollow({
        handle: 'x',
      });
    },
  );
  smokeCase(
    'usersSocial.report:single',
    { operation: 'report', path: '/api/trpc/users.report' },
    'report',
    async () => {
      await client.usersSocial.report({
        handle: 'x',
        reason: 'x',
      });
    },
  );
});
