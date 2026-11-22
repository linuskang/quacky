# Quacky tRPC TypeScript API

Complete reference of every operation, grouped by resource. See [the README](./README.md) for usage and configuration.

## Contents

- [`MetaFeeds`](#metafeeds)
  - [meta.get (query)](#metaget-query)
  - [meta.trending (query)](#metatrending-query)
  - [meta.news (query)](#metanews-query)
  - [meta.leaderboard (query)](#metaleaderboard-query)
  - [meta.feedback (mutation)](#metafeedback-mutation)
- [`CurrentUser`](#currentuser)
  - [me.get (query)](#meget-query)
  - [me.updateBio (mutation)](#meupdatebio-mutation)
  - [me.checkIn (mutation)](#mecheckin-mutation)
  - [me.parentEmailGet (query)](#meparentemailget-query)
  - [me.parentEmailSet (mutation)](#meparentemailset-mutation)
  - [me.bookmarks (query)](#mebookmarks-query)
  - [me.notifications (query)](#menotifications-query)
  - [me.pushSubscribe (mutation)](#mepushsubscribe-mutation)
  - [me.pushUnsubscribe (mutation)](#mepushunsubscribe-mutation)
  - [me.pushTest (mutation)](#mepushtest-mutation)
- [`Posts`](#posts)
  - [posts.feed (query)](#postsfeed-query)
  - [posts.byId (query)](#postsbyid-query)
  - [posts.create (mutation)](#postscreate-mutation)
  - [posts.update (mutation)](#postsupdate-mutation)
  - [posts.delete (mutation)](#postsdelete-mutation)
  - [posts.like (mutation)](#postslike-mutation)
  - [posts.unlike (mutation)](#postsunlike-mutation)
  - [posts.bookmark (mutation)](#postsbookmark-mutation)
  - [posts.unbookmark (mutation)](#postsunbookmark-mutation)
  - [posts.repost (mutation)](#postsrepost-mutation)
  - [posts.quote (mutation)](#postsquote-mutation)
  - [posts.report (mutation)](#postsreport-mutation)
- [`Comments`](#comments)
  - [comments.byId (query)](#commentsbyid-query)
  - [comments.create (mutation)](#commentscreate-mutation)
  - [comments.delete (mutation)](#commentsdelete-mutation)
  - [comments.report (mutation)](#commentsreport-mutation)
- [`UsersSocial`](#userssocial)
  - [users.byHandle (query)](#usersbyhandle-query)
  - [users.mentions (query)](#usersmentions-query)
  - [users.suggested (query)](#userssuggested-query)
  - [users.followers (query)](#usersfollowers-query)
  - [users.following (query)](#usersfollowing-query)
  - [users.follow (mutation)](#usersfollow-mutation)
  - [users.unfollow (mutation)](#usersunfollow-mutation)
  - [users.report (mutation)](#usersreport-mutation)
- [`DirectMessages`](#directmessages)
  - [dms.conversations (query)](#dmsconversations-query)
  - [dms.messages (query)](#dmsmessages-query)
  - [dms.send (mutation)](#dmssend-mutation)
- [`WarmFuzzies`](#warmfuzzies)
  - [fuzzies.list (query)](#fuzzieslist-query)
  - [fuzzies.send (mutation)](#fuzziessend-mutation)
  - [fuzzies.report (mutation)](#fuzziesreport-mutation)
- [`Memeland`](#memeland)
  - [memes.list (query)](#memeslist-query)
  - [memes.byId (query)](#memesbyid-query)
  - [memes.create (mutation)](#memescreate-mutation)
  - [memes.vote (mutation)](#memesvote-mutation)
  - [memes.report (mutation)](#memesreport-mutation)
- [`Shorts`](#shorts)
  - [shorts.list (query)](#shortslist-query)
  - [shorts.byId (query)](#shortsbyid-query)
  - [shorts.create (mutation)](#shortscreate-mutation)
  - [shorts.report (mutation)](#shortsreport-mutation)
- [`Quizzes`](#quizzes)
  - [quiz.list (query)](#quizlist-query)
  - [quiz.bySlug (query)](#quizbyslug-query)
  - [quiz.submit (mutation)](#quizsubmit-mutation)
- [`DailyRng`](#dailyrng)
  - [rng.mine (query)](#rngmine-query)
  - [rng.today (query)](#rngtoday-query)
  - [rng.roll (mutation)](#rngroll-mutation)
- [`Shop`](#shop)
  - [shop.list (query)](#shoplist-query)
  - [shop.byId (query)](#shopbyid-query)
  - [shop.purchase (mutation)](#shoppurchase-mutation)
  - [shop.myOrders (query)](#shopmyorders-query)
  - [shop.wishlistList (query)](#shopwishlistlist-query)
  - [shop.wishlistAdd (mutation)](#shopwishlistadd-mutation)
  - [shop.wishlistRemove (mutation)](#shopwishlistremove-mutation)
  - [shop.suggestionsList (query)](#shopsuggestionslist-query)
  - [shop.suggestionsCreate (mutation)](#shopsuggestionscreate-mutation)
  - [shop.suggestionsUpdateStatus (mutation)](#shopsuggestionsupdatestatus-mutation)
  - [shop.suggestionVotes (query)](#shopsuggestionvotes-query)
- [`Uploads`](#uploads)
  - [upload.file (mutation)](#uploadfile-mutation)
- [`Administration`](#administration)
  - [admin.stats (query)](#adminstats-query)
  - [admin.invite (mutation)](#admininvite-mutation)
  - [admin.lock (mutation)](#adminlock-mutation)
  - [admin.broadcastNotification (mutation)](#adminbroadcastnotification-mutation)
  - [admin.usersList (query)](#adminuserslist-query)
  - [admin.userByHandle (query)](#adminuserbyhandle-query)
  - [admin.userUpdate (mutation)](#adminuserupdate-mutation)
  - [admin.ordersList (query)](#adminorderslist-query)
  - [admin.ordersUpdateStatus (mutation)](#adminordersupdatestatus-mutation)
  - [admin.ordersDelete (mutation)](#adminordersdelete-mutation)
  - [admin.shopItemsList (query)](#adminshopitemslist-query)
  - [admin.shopItemsCreate (mutation)](#adminshopitemscreate-mutation)
  - [admin.shopItemsUpdate (mutation)](#adminshopitemsupdate-mutation)
  - [admin.shopItemsDelete (mutation)](#adminshopitemsdelete-mutation)
- [`SystemDebug`](#systemdebug)
  - [system.debug (query)](#systemdebug-query)
  - [system.testPush (mutation)](#systemtestpush-mutation)
  - [system.test (mutation)](#systemtest-mutation)

## Setup

```ts
import QuackyTRPCAPI from '@kang-id/quacky-trpc';

const client = new QuackyTRPCAPI();
```

## `MetaFeeds`

### meta.get (query)

Get public Quacky instance metadata, stats, rules, and QOTD.

**Auth:** Public (no session required)

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.metaFeeds.list();
```

### meta.trending (query)

Get top trending hashtags across unflagged posts.

**Auth:** Public (no session required)

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.metaFeeds.trending();
```

### meta.news (query)

Fetch and parse the ABC News RSS feed.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.metaFeeds.news();
```

### meta.leaderboard (query)

Get top public users ranked by points.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.metaFeeds.leaderboard();
```

### meta.feedback (mutation)

Submit product feedback to the feedback portal.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`MetaFeedFeedbackParams`](./src/resources/meta-feeds.ts) |

```ts
await client.metaFeeds.feedback({
  usability: 1,
  satisfaction: 1,
  recommend: 1,
  visual: 1,
  comments: 'x',
});
```

## `CurrentUser`

### me.get (query)

Get the signed-in user's check-in status, permissions, unread counts, streak, and point balance.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.currentUser.list();
```

### me.updateBio (mutation)

Update the signed-in user's bio.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`CurrentUserUpdateBioParams`](./src/resources/current-user.ts) |

```ts
await client.currentUser.updateBio({
  bio: '',
});
```

### me.checkIn (mutation)

Submit today's wellbeing daily check-in.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`CurrentUserCheckInParams`](./src/resources/current-user.ts) |

```ts
await client.currentUser.checkIn({
  wellbeing: 1,
  happiness: 1,
  stress: 1,
  sleep: 1,
  energy: 1,
  assistance: false,
});
```

### me.parentEmailGet (query)

Get the signed-in user's configured parent email.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.currentUser.parentEmailGet();
```

### me.parentEmailSet (mutation)

Set a parent email and send a notification email.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`CurrentUserParentEmailSetParams`](./src/resources/current-user.ts) |

```ts
await client.currentUser.parentEmailSet({
  parentEmail: 'user@example.com',
});
```

### me.bookmarks (query)

Fetch the signed-in user's bookmarked posts.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.currentUser.bookmarks();
```

### me.notifications (query)

Fetch the signed-in user's notifications.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.currentUser.notifications();
```

### me.pushSubscribe (mutation)

Register a Web Push subscription for the signed-in user.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`CurrentUserPushSubscribeParams`](./src/resources/current-user.ts) |

```ts
await client.currentUser.pushSubscribe({
  endpoint: 'https://example.com',
  keys: {
    auth: 'x',
    p256dh: 'x',
  },
});
```

### me.pushUnsubscribe (mutation)

Remove a Web Push subscription for the signed-in user.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`CurrentUserPushUnsubscribeParams`](./src/resources/current-user.ts) |

```ts
await client.currentUser.pushUnsubscribe({
  endpoint: 'x',
});
```

### me.pushTest (mutation)

Send a test push notification to the signed-in user.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`CurrentUserPushTestParams`](./src/resources/current-user.ts) |

```ts
await client.currentUser.pushTest({
  message: 'This is a test notification from Quacky!',
});
```

## `Posts`

### posts.feed (query)

Fetch a post feed (recent, following, popular, or foryou), optionally filtered by hashtag.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`PostFeedParams`](./src/resources/posts.ts) |

```ts
await client.posts.feed();
```

### posts.byId (query)

Get a single post with its comments and engagement state, recording a view.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`PostIDParams`](./src/resources/posts.ts) |

```ts
await client.posts.id();
```

### posts.create (mutation)

Create a new post with up to 2 attachments.

**Auth:** Session + unlocked posting module required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostCreateParams`](./src/resources/posts.ts) |

```ts
await client.posts.create({
  content: 'x',
  attachments: [],
});
```

### posts.update (mutation)

Edit the content of a post owned by the signed-in user.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostUpdateParams`](./src/resources/posts.ts) |

```ts
await client.posts.update({
  id: 'x',
  content: 'x',
});
```

### posts.delete (mutation)

Delete a post (owner or admin).

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostDeleteParams`](./src/resources/posts.ts) |

```ts
await client.posts.delete({
  id: 'x',
});
```

### posts.like (mutation)

Like a post.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostLikeParams`](./src/resources/posts.ts) |

```ts
await client.posts.like({
  id: 'x',
});
```

### posts.unlike (mutation)

Remove a like from a post.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostUnlikeParams`](./src/resources/posts.ts) |

```ts
await client.posts.unlike({
  id: 'x',
});
```

### posts.bookmark (mutation)

Bookmark a post.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostBookmarkParams`](./src/resources/posts.ts) |

```ts
await client.posts.bookmark({
  id: 'x',
});
```

### posts.unbookmark (mutation)

Remove a post from bookmarks.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostUnbookmarkParams`](./src/resources/posts.ts) |

```ts
await client.posts.unbookmark({
  id: 'x',
});
```

### posts.repost (mutation)

Repost an existing post.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostRepostParams`](./src/resources/posts.ts) |

```ts
await client.posts.repost({
  postId: 'x',
});
```

### posts.quote (mutation)

Quote-repost an existing post with commentary.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostQuoteParams`](./src/resources/posts.ts) |

```ts
await client.posts.quote({
  postId: 'x',
  content: 'x',
});
```

### posts.report (mutation)

Report a post for moderation review.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`PostReportParams`](./src/resources/posts.ts) |

```ts
await client.posts.report({
  id: 'x',
  reason: 'x',
});
```

## `Comments`

### comments.byId (query)

Get a comment, its parent post, sibling comments, and relevant users.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`CommentIDParams`](./src/resources/comments.ts) |

```ts
await client.comments.id();
```

### comments.create (mutation)

Create a comment on a post.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`CommentCreateParams`](./src/resources/comments.ts) |

```ts
await client.comments.create({
  postId: 'x',
  content: 'x',
});
```

### comments.delete (mutation)

Delete a comment (owner or admin).

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`CommentDeleteParams`](./src/resources/comments.ts) |

```ts
await client.comments.delete({
  id: 'x',
});
```

### comments.report (mutation)

Report a comment for moderation review.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`CommentReportParams`](./src/resources/comments.ts) |

```ts
await client.comments.report({
  id: 'x',
  reason: 'x',
});
```

## `UsersSocial`

### users.byHandle (query)

Get a user's profile by handle.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`UsersSocialHandleParams`](./src/resources/users-social.ts) |

```ts
await client.usersSocial.handle();
```

### users.mentions (query)

Search unbanned users by username prefix/substring for mentions or recipient pickers.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`UsersSocialMentionsParams`](./src/resources/users-social.ts) |

```ts
await client.usersSocial.mentions();
```

### users.suggested (query)

Get up to 3 suggested users to follow.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.usersSocial.suggested();
```

### users.followers (query)

List followers of a public user, with optional search.

**Auth:** Public (no session required)

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`UsersSocialFollowersParams`](./src/resources/users-social.ts) |

```ts
await client.usersSocial.followers();
```

### users.following (query)

List accounts followed by a public user, with optional search.

**Auth:** Public (no session required)

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`UsersSocialFollowingParams`](./src/resources/users-social.ts) |

```ts
await client.usersSocial.following();
```

### users.follow (mutation)

Follow a user by handle.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`UsersSocialFollowParams`](./src/resources/users-social.ts) |

```ts
await client.usersSocial.follow({
  handle: 'x',
});
```

### users.unfollow (mutation)

Unfollow a user by handle.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`UsersSocialUnfollowParams`](./src/resources/users-social.ts) |

```ts
await client.usersSocial.unfollow({
  handle: 'x',
});
```

### users.report (mutation)

Report a user profile for moderation review.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`UsersSocialReportParams`](./src/resources/users-social.ts) |

```ts
await client.usersSocial.report({
  handle: 'x',
  reason: 'x',
});
```

## `DirectMessages`

### dms.conversations (query)

List direct message conversations for the signed-in user.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.directMessages.conversations();
```

### dms.messages (query)

Fetch direct messages between the signed-in user and another handle.

**Auth:** Session + unlocked DMs module required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`DirectMessageListParams`](./src/resources/direct-messages.ts) |

```ts
await client.directMessages.list();
```

### dms.send (mutation)

Send a direct message to another user by handle.

**Auth:** Session + unlocked DMs module required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`DirectMessageSendParams`](./src/resources/direct-messages.ts) |

```ts
await client.directMessages.send({
  handle: 'x',
  message: 'x',
});
```

## `WarmFuzzies`

### fuzzies.list (query)

Fetch warm fuzzies received by the signed-in user and mark them as read.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.warmFuzzies.list();
```

### fuzzies.send (mutation)

Send an anonymous warm fuzzy to another user.

**Auth:** Session + unlocked Warm Fuzzies module required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`WarmFuzzySendParams`](./src/resources/warm-fuzzies.ts) |

```ts
await client.warmFuzzies.send({
  receiverId: 'x',
  message: 'x',
});
```

### fuzzies.report (mutation)

Report an inappropriate warm fuzzy.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`WarmFuzzyReportParams`](./src/resources/warm-fuzzies.ts) |

```ts
await client.warmFuzzies.report({
  id: 'x',
  reason: 'x',
});
```

## `Memeland`

### memes.list (query)

List unflagged memes with vote counts, score, and the current user's vote in a single query.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.memeland.list();
```

### memes.byId (query)

Get a single meme by ID with vote counts and the current user's vote.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`MemelandIDParams`](./src/resources/memeland.ts) |

```ts
await client.memeland.id();
```

### memes.create (mutation)

Publish a new meme by uploaded image URL.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`MemelandCreateParams`](./src/resources/memeland.ts) |

```ts
await client.memeland.create({
  image: 'x',
});
```

### memes.vote (mutation)

Upvote or downvote a meme.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`MemelandVoteParams`](./src/resources/memeland.ts) |

```ts
await client.memeland.vote({
  id: 'x',
  type: 'UPVOTE',
});
```

### memes.report (mutation)

Report an inappropriate meme.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`MemelandReportParams`](./src/resources/memeland.ts) |

```ts
await client.memeland.report({
  id: 'x',
  reason: 'x',
});
```

## `Shorts`

### shorts.list (query)

List unflagged short videos.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.shorts.list();
```

### shorts.byId (query)

Get a single short video by ID.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`ShortIDParams`](./src/resources/shorts.ts) |

```ts
await client.shorts.id();
```

### shorts.create (mutation)

Upload a short video via multipart FormData (`video` file and optional `description`).

**Auth:** Authenticated session required

tRPC multipart mutation procedure. Submit `multipart/form-data` directly via POST.

| Direction | Type |
| --- | --- |
| Request | [`ShortCreateParams`](./src/resources/shorts.ts) |

```ts
await client.shorts.create({});
```

### shorts.report (mutation)

Report a short video for moderation review.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`ShortReportParams`](./src/resources/shorts.ts) |

```ts
await client.shorts.report({
  id: 'x',
  reason: 'x',
});
```

## `Quizzes`

### quiz.list (query)

List all available onboarding/feature quizzes.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.quizzes.list();
```

### quiz.bySlug (query)

Get a quiz's metadata and shuffled questions by slug/ID.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`QuizSlugParams`](./src/resources/quizzes.ts) |

```ts
await client.quizzes.slug();
```

### quiz.submit (mutation)

Grade quiz answers; awards XP and unlocks the corresponding feature module on pass, or returns wrong question numbers and AI feedback.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`QuizSubmitParams`](./src/resources/quizzes.ts) |

```ts
await client.quizzes.submit({
  id: 'x',
  answers: {},
});
```

## `DailyRng`

### rng.mine (query)

Get the signed-in user's RNG roll and rank for today, or null if they haven't rolled yet.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.dailyRng.mine();
```

### rng.today (query)

Get today's top 10 RNG leaderboard entries and total player count.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.dailyRng.today();
```

### rng.roll (mutation)

Roll today's random number (once per UTC day).

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

```ts
await client.dailyRng.roll();
```

## `Shop`

### shop.list (query)

List available shop items along with the signed-in user's point balance.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.shop.list();
```

### shop.byId (query)

Get details of a single shop item by ID.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`ShopIDParams`](./src/resources/shop.ts) |

```ts
await client.shop.id();
```

### shop.purchase (mutation)

Purchase a shop item using points.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`ShopPurchaseParams`](./src/resources/shop.ts) |

```ts
await client.shop.purchase({
  id: 'x',
  quantity: 1,
});
```

### shop.myOrders (query)

List the signed-in user's shop purchases.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.shop.myOrders();
```

### shop.wishlistList (query)

Get the signed-in user's shop wishlist and points balance.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.shop.wishlistList();
```

### shop.wishlistAdd (mutation)

Add an item to the signed-in user's wishlist.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`ShopWishlistAddParams`](./src/resources/shop.ts) |

```ts
await client.shop.wishlistAdd({
  itemId: 'x',
});
```

### shop.wishlistRemove (mutation)

Remove an item from the signed-in user's wishlist.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`ShopWishlistRemoveParams`](./src/resources/shop.ts) |

```ts
await client.shop.wishlistRemove({
  itemId: 'x',
});
```

### shop.suggestionsList (query)

List pending shop item suggestions.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.shop.suggestionsList();
```

### shop.suggestionsCreate (mutation)

Submit a new shop item suggestion.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`ShopSuggestionsCreateParams`](./src/resources/shop.ts) |

```ts
await client.shop.suggestionsCreate({
  name: 'x',
  image: 'x',
  description: 'x',
});
```

### shop.suggestionsUpdateStatus (mutation)

Update a shop suggestion's pending state (admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`ShopSuggestionsUpdateStatusParams`](./src/resources/shop.ts) |

```ts
await client.shop.suggestionsUpdateStatus({
  id: 'x',
  pending: false,
});
```

### shop.suggestionVotes (query)

List votes for a given shop suggestion.

**Auth:** Authenticated session required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`ShopSuggestionVotesParams`](./src/resources/shop.ts) |

```ts
await client.shop.suggestionVotes();
```

## `Uploads`

### upload.file (mutation)

Upload a file via multipart FormData (`file` field) and return its public storage URL.

**Auth:** Authenticated session required

tRPC multipart mutation procedure. Submit `multipart/form-data` directly via POST.

| Direction | Type |
| --- | --- |
| Request | [`UploadUploadFileParams`](./src/resources/uploads.ts) |

```ts
await client.uploads.uploadFile({});
```

## `Administration`

### admin.stats (query)

Get aggregate wellbeing check-in statistics (admin only).

**Auth:** Admin role required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.administration.stats();
```

### admin.invite (mutation)

Invite and create a new user with a temporary password (admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationInviteParams`](./src/resources/administration.ts) |

```ts
await client.administration.invite({
  email: 'user@example.com',
  role: 'admin',
  displayName: 'x',
  username: 'x',
});
```

### admin.lock (mutation)

Update global site feature lock state (admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationLockParams`](./src/resources/administration.ts) |

```ts
await client.administration.lock({
  locked: false,
});
```

### admin.broadcastNotification (mutation)

Broadcast a notification to all accounts (admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationBroadcastNotificationParams`](./src/resources/administration.ts) |

```ts
await client.administration.broadcastNotification({
  userId: 'quacky',
  content: 'x',
});
```

### admin.usersList (query)

List all user accounts (admin only).

**Auth:** Admin role required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.administration.usersList();
```

### admin.userByHandle (query)

Get a full user record by handle (admin only).

**Auth:** Admin role required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationUserByHandleParams`](./src/resources/administration.ts) |

```ts
await client.administration.userByHandle();
```

### admin.userUpdate (mutation)

Update a user's fields and audit changes (admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationUserUpdateParams`](./src/resources/administration.ts) |

```ts
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
```

### admin.ordersList (query)

List pending shop orders (admin only).

**Auth:** Admin role required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.administration.ordersList();
```

### admin.ordersUpdateStatus (mutation)

Fulfill or reject a pending shop order (refunding points and restoring stock on rejection; admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationOrdersUpdateStatusParams`](./src/resources/administration.ts) |

```ts
await client.administration.ordersUpdateStatus({
  orderId: 'x',
  actionOrderStatus: 'FULFILLED',
});
```

### admin.ordersDelete (mutation)

Delete a shop order (admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationOrdersDeleteParams`](./src/resources/administration.ts) |

```ts
await client.administration.ordersDelete({
  orderId: 'x',
});
```

### admin.shopItemsList (query)

List all shop items including unavailable ones (admin only).

**Auth:** Admin role required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.administration.shopItemsList();
```

### admin.shopItemsCreate (mutation)

Create a new shop item (admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationShopItemsCreateParams`](./src/resources/administration.ts) |

```ts
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
```

### admin.shopItemsUpdate (mutation)

Update an existing shop item (admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationShopItemsUpdateParams`](./src/resources/administration.ts) |

```ts
await client.administration.shopItemsUpdate({
  id: 'x',
});
```

### admin.shopItemsDelete (mutation)

Delete a shop item by ID (admin only).

**Auth:** Admin role required

tRPC mutation procedure. Submit JSON input in the request body.

| Direction | Type |
| --- | --- |
| Request | [`AdministrationShopItemsDeleteParams`](./src/resources/administration.ts) |

```ts
await client.administration.shopItemsDelete({
  id: 'x',
});
```

## `SystemDebug`

### system.debug (query)

Get server, database, and activity debug metrics (requires Stats for Nerds).

**Auth:** Session + 'Stats for Nerds' enabled required

tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.

```ts
await client.systemDebug.list();
```

### system.testPush (mutation)

Send a test PWA push notification to the signed-in user.

**Auth:** Authenticated session required

tRPC mutation procedure. Submit JSON input in the request body.

```ts
await client.systemDebug.testPush();
```

### system.test (mutation)

Trigger a test event in Upstream.

**Auth:** Public (no session required)

tRPC mutation procedure. Submit JSON input in the request body.

```ts
await client.systemDebug.test();
```
