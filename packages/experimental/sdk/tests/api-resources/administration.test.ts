// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource administration', () => {
  smokeCase(
    'administration.stats:single',
    { operation: 'stats', path: '/api/trpc/admin.stats' },
    'stats',
    async () => {
      await client.administration.stats();
    },
  );
  smokeCase(
    'administration.invite:single',
    { operation: 'invite', path: '/api/trpc/admin.invite' },
    'invite',
    async () => {
      await client.administration.invite({
        email: 'user@example.com',
        role: 'admin',
        displayName: 'x',
        username: 'x',
      });
    },
  );
  smokeCase(
    'administration.lock:single',
    { operation: 'lock', path: '/api/trpc/admin.lock' },
    'lock',
    async () => {
      await client.administration.lock({
        locked: false,
      });
    },
  );
  smokeCase(
    'administration.broadcastNotification:single',
    { operation: 'broadcastNotification', path: '/api/trpc/admin.broadcastNotification' },
    'broadcastNotification',
    async () => {
      await client.administration.broadcastNotification({
        userId: 'quacky',
        content: 'x',
      });
    },
  );
  smokeCase(
    'administration.usersList:single',
    { operation: 'usersList', path: '/api/trpc/admin.usersList' },
    'usersList',
    async () => {
      await client.administration.usersList();
    },
  );
  smokeCase(
    'administration.userByHandle:required',
    { operation: 'userByHandle', path: '/api/trpc/admin.userByHandle' },
    'userByHandle: only required params',
    async () => {
      await client.administration.userByHandle();
    },
  );
  smokeCase(
    'administration.userByHandle:all',
    { operation: 'userByHandle', path: '/api/trpc/admin.userByHandle' },
    'userByHandle: required and optional params',
    async () => {
      await client.administration.userByHandle({
        input: 'input',
      });
    },
  );
  smokeCase(
    'administration.userUpdate:single',
    { operation: 'userUpdate', path: '/api/trpc/admin.userUpdate' },
    'userUpdate',
    async () => {
      await client.administration.userUpdate({
        name: 'x',
        username: 'x',
        email: 'user@example.com',
        emailVerified: false,
        image: 'x',
        verified: false,
        statsForNerds: false,
        private: false,
        streamerMode: false,
        hideTips: false,
        bio: '',
        bannerImage: '',
        pronoun: '',
        location: '',
        website: '',
        role: '',
        banned: false,
        banReason: '',
        banExpires: {},
        parentEmail: '',
        unlockedPosting: false,
        unlockedCommenting: false,
        unlockedDms: false,
        unlockedFuzzies: false,
        unlockedProfiles: false,
        xp: 0,
        points: 0,
        pushNotificationsEnabled: false,
        handle: 'x',
      });
    },
  );
  smokeCase(
    'administration.ordersList:single',
    { operation: 'ordersList', path: '/api/trpc/admin.ordersList' },
    'ordersList',
    async () => {
      await client.administration.ordersList();
    },
  );
  smokeCase(
    'administration.ordersUpdateStatus:single',
    { operation: 'ordersUpdateStatus', path: '/api/trpc/admin.ordersUpdateStatus' },
    'ordersUpdateStatus',
    async () => {
      await client.administration.ordersUpdateStatus({
        orderId: 'x',
        actionOrderStatus: 'FULFILLED',
      });
    },
  );
  smokeCase(
    'administration.ordersDelete:single',
    { operation: 'ordersDelete', path: '/api/trpc/admin.ordersDelete' },
    'ordersDelete',
    async () => {
      await client.administration.ordersDelete({
        orderId: 'x',
      });
    },
  );
  smokeCase(
    'administration.shopItemsList:single',
    { operation: 'shopItemsList', path: '/api/trpc/admin.shopItemsList' },
    'shopItemsList',
    async () => {
      await client.administration.shopItemsList();
    },
  );
  smokeCase(
    'administration.shopItemsCreate:single',
    { operation: 'shopItemsCreate', path: '/api/trpc/admin.shopItemsCreate' },
    'shopItemsCreate',
    async () => {
      await client.administration.shopItemsCreate({
        name: 'x',
        description: 'x',
        price: 0,
        stock: 0,
        category: 'x',
        imageUrl: 'x',
        available: false,
        featured: false,
      });
    },
  );
  smokeCase(
    'administration.shopItemsUpdate:required',
    { operation: 'shopItemsUpdate', path: '/api/trpc/admin.shopItemsUpdate' },
    'shopItemsUpdate: only required params',
    async () => {
      await client.administration.shopItemsUpdate({
        id: 'x',
      });
    },
  );
  smokeCase(
    'administration.shopItemsUpdate:all',
    { operation: 'shopItemsUpdate', path: '/api/trpc/admin.shopItemsUpdate' },
    'shopItemsUpdate: required and optional params',
    async () => {
      await client.administration.shopItemsUpdate({
        name: 'x',
        description: 'x',
        price: 0,
        stock: 0,
        category: 'x',
        imageUrl: 'x',
        available: false,
        featured: false,
        id: 'x',
      });
    },
  );
  smokeCase(
    'administration.shopItemsDelete:single',
    { operation: 'shopItemsDelete', path: '/api/trpc/admin.shopItemsDelete' },
    'shopItemsDelete',
    async () => {
      await client.administration.shopItemsDelete({
        id: 'x',
      });
    },
  );
});
