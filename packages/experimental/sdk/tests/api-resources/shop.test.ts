// File generated from our OpenAPI spec by Scalar. See README.md for details.

// Smoke tests for one resource; see smoke-support.ts for how to run them.
import { describe } from 'vitest';

import { client, smokeCase } from '../smoke-support';

describe.concurrent('resource shop', () => {
  smokeCase('shop.list:single', { operation: 'list', path: '/api/trpc/shop.list' }, 'list', async () => {
    await client.shop.list();
  });
  smokeCase(
    'shop.id:required',
    { operation: 'id', path: '/api/trpc/shop.byId' },
    'id: only required params',
    async () => {
      await client.shop.id();
    },
  );
  smokeCase(
    'shop.id:all',
    { operation: 'id', path: '/api/trpc/shop.byId' },
    'id: required and optional params',
    async () => {
      await client.shop.id({
        input: 'input',
      });
    },
  );
  smokeCase(
    'shop.purchase:single',
    { operation: 'purchase', path: '/api/trpc/shop.purchase' },
    'purchase',
    async () => {
      await client.shop.purchase({
        id: 'x',
        quantity: 1,
      });
    },
  );
  smokeCase(
    'shop.myOrders:single',
    { operation: 'myOrders', path: '/api/trpc/shop.myOrders' },
    'myOrders',
    async () => {
      await client.shop.myOrders();
    },
  );
  smokeCase(
    'shop.wishlistList:single',
    { operation: 'wishlistList', path: '/api/trpc/shop.wishlistList' },
    'wishlistList',
    async () => {
      await client.shop.wishlistList();
    },
  );
  smokeCase(
    'shop.wishlistAdd:single',
    { operation: 'wishlistAdd', path: '/api/trpc/shop.wishlistAdd' },
    'wishlistAdd',
    async () => {
      await client.shop.wishlistAdd({
        itemId: 'x',
      });
    },
  );
  smokeCase(
    'shop.wishlistRemove:single',
    { operation: 'wishlistRemove', path: '/api/trpc/shop.wishlistRemove' },
    'wishlistRemove',
    async () => {
      await client.shop.wishlistRemove({
        itemId: 'x',
      });
    },
  );
  smokeCase(
    'shop.suggestionsList:single',
    { operation: 'suggestionsList', path: '/api/trpc/shop.suggestionsList' },
    'suggestionsList',
    async () => {
      await client.shop.suggestionsList();
    },
  );
  smokeCase(
    'shop.suggestionsCreate:single',
    { operation: 'suggestionsCreate', path: '/api/trpc/shop.suggestionsCreate' },
    'suggestionsCreate',
    async () => {
      await client.shop.suggestionsCreate({
        name: 'x',
        image: 'x',
        description: 'x',
      });
    },
  );
  smokeCase(
    'shop.suggestionsUpdateStatus:single',
    { operation: 'suggestionsUpdateStatus', path: '/api/trpc/shop.suggestionsUpdateStatus' },
    'suggestionsUpdateStatus',
    async () => {
      await client.shop.suggestionsUpdateStatus({
        id: 'x',
        pending: false,
      });
    },
  );
  smokeCase(
    'shop.suggestionVotes:required',
    { operation: 'suggestionVotes', path: '/api/trpc/shop.suggestionVotes' },
    'suggestionVotes: only required params',
    async () => {
      await client.shop.suggestionVotes();
    },
  );
  smokeCase(
    'shop.suggestionVotes:all',
    { operation: 'suggestionVotes', path: '/api/trpc/shop.suggestionVotes' },
    'suggestionVotes: required and optional params',
    async () => {
      await client.shop.suggestionVotes({
        input: 'input',
      });
    },
  );
});
