// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource currentUser', () => {
  smokeCase('currentUser.list:single', { operation: 'list', path: '/api/trpc/me.get' }, 'list', async () => {
    await client.currentUser.list();
  });
  smokeCase(
    'currentUser.updateBio:single',
    { operation: 'updateBio', path: '/api/trpc/me.updateBio' },
    'updateBio',
    async () => {
      await client.currentUser.updateBio({
        bio: '',
      });
    },
  );
  smokeCase(
    'currentUser.checkIn:single',
    { operation: 'checkIn', path: '/api/trpc/me.checkIn' },
    'checkIn',
    async () => {
      await client.currentUser.checkIn({
        wellbeing: 1,
        happiness: 1,
        stress: 1,
        sleep: 1,
        energy: 1,
        assistance: false,
      });
    },
  );
  smokeCase(
    'currentUser.parentEmailGet:single',
    { operation: 'parentEmailGet', path: '/api/trpc/me.parentEmailGet' },
    'parentEmailGet',
    async () => {
      await client.currentUser.parentEmailGet();
    },
  );
  smokeCase(
    'currentUser.parentEmailSet:single',
    { operation: 'parentEmailSet', path: '/api/trpc/me.parentEmailSet' },
    'parentEmailSet',
    async () => {
      await client.currentUser.parentEmailSet({
        parentEmail: 'user@example.com',
      });
    },
  );
  smokeCase(
    'currentUser.bookmarks:single',
    { operation: 'bookmarks', path: '/api/trpc/me.bookmarks' },
    'bookmarks',
    async () => {
      await client.currentUser.bookmarks();
    },
  );
  smokeCase(
    'currentUser.notifications:single',
    { operation: 'notifications', path: '/api/trpc/me.notifications' },
    'notifications',
    async () => {
      await client.currentUser.notifications();
    },
  );
  smokeCase(
    'currentUser.pushSubscribe:single',
    { operation: 'pushSubscribe', path: '/api/trpc/me.pushSubscribe' },
    'pushSubscribe',
    async () => {
      await client.currentUser.pushSubscribe({
        endpoint: 'https://example.com',
        keys: {
          auth: 'x',
          p256dh: 'x',
        },
      });
    },
  );
  smokeCase(
    'currentUser.pushUnsubscribe:single',
    { operation: 'pushUnsubscribe', path: '/api/trpc/me.pushUnsubscribe' },
    'pushUnsubscribe',
    async () => {
      await client.currentUser.pushUnsubscribe({
        endpoint: 'x',
      });
    },
  );
  smokeCase(
    'currentUser.pushTest:single',
    { operation: 'pushTest', path: '/api/trpc/me.pushTest' },
    'pushTest',
    async () => {
      await client.currentUser.pushTest({
        message: 'This is a test notification from Quacky!',
      });
    },
  );
});
