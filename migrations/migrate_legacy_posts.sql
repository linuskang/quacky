-- Generated from uploaded old posts JSON
-- New schema: Post + Attachment
-- Skips rows where parentId IS NOT NULL
-- Replaces old @linus authorId with Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu
-- Attachment IDs are explicitly generated to avoid NULL id errors in DataGrip/Postgres

BEGIN;

INSERT INTO "post" (
    id, "authorId", content, flagged, edited, "createdAt", "updatedAt", views, "repostOfId"
) VALUES
      ('cmmrgjxg300020iqzx2l40hhi', '2e0dd57a-4817-4ca4-b519-72b981e778d1', 'Hi :)', false, false, '2026-03-15 07:53:31.923', '2026-03-15 07:53:31.923', 0, NULL),
      ('cmmupnql2000d0iqzv5iqtg7b', '8db15dc2-ce79-4d5c-8136-933fa505f165', 'Hi people!', false, false, '2026-03-17 14:31:44.726', '2026-03-17 14:31:44.726', 0, NULL),
      ('cmmusb3ke000l0iqz52yohhgi', '939bcf68-816c-4fb1-a0a7-7c6b6408ec05', 'testing one two three damn lowkey fire project', false, false, '2026-03-17 15:45:53.870', '2026-03-17 15:45:53.870', 0, NULL),
      ('cmmusbiow000o0iqzbke2jllo', 'ecb82e8d-26f2-4eca-a35d-f2a1cfd100ea', 'Hello everyone!', false, false, '2026-03-17 15:46:13.472', '2026-03-17 15:46:13.472', 0, NULL),
      ('cmmuscq7i000p0iqz5nilgved', '383bfae4-2e57-4ddd-b605-6eabbe6149ef', 'Good project. Fire', false, false, '2026-03-17 15:47:09.870', '2026-03-17 15:47:09.870', 0, NULL),
      ('cmmvmamsx000t0iqzrv7bmw9p', '2afaa86e-9dc5-49a7-8a7e-829a9fb4c828', 'Wazzzup', false, false, '2026-03-18 05:45:20.625', '2026-03-18 05:45:20.625', 0, NULL),
      ('cmmrgltno00050iqz5bamo0d7', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'whats good!', true, false, '2026-03-15 07:55:00.324', '2026-05-06 04:18:12.352', 0, NULL),
      ('cmmre4vgu00000iqzj7m6y7e1', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'WOOOOOOOOO #quacky IS ONLINE!', false, true, '2026-03-15 06:45:50.286', '2026-05-06 04:23:26.062', 1, NULL),
      ('cmmus3ob6000f0iqzzebn6nv7', 'c63e816b-3cb8-450e-8e03-2a5f8c81f9e7', 'I love cute elements in here!! keep cooking blud!', false, false, '2026-03-17 15:40:07.506', '2026-04-06 08:49:29.187', 0, NULL),
      ('cmmrec4gs00020iqzdkw64jl0', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '# V1 beta!
Things still in development that will be released later this week include:
DMs
Rework of notifications
Finishing of APIs and docs.

Stay tuned!

For more information, check out https://linuskang.au/quacky', false, true, '2026-03-15 06:51:28.540', '2026-05-06 04:27:35.790', 0, NULL),
      ('cmnmlf8dq000001pcdpfzl145', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'stfu', true, false, '2026-04-06 02:50:42.350', '2026-04-06 02:50:50.361', 0, NULL),
      ('cmnjqcjmh000001pgxrfvhgmc', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'Hello! This is a read-only post with a cool bird 😎', false, false, '2026-04-04 02:45:16.505', '2026-04-15 05:31:14.145', 0, NULL),
      ('cmnkbql4y000501s4gum560a4', 'iodXnSu0v7pCS4O9hVcSZVECy2EYVESv', 'e', true, false, '2026-04-04 12:44:03.586', '2026-04-04 12:44:22.289', 0, NULL),
      ('cmmz6qdny00000jqlfwv63hsa', '894782f6-11bd-4886-b211-e8fc2ed02e4d', 'post swajflkdjfs', true, false, '2026-03-20 17:40:46.126', '2026-04-05 09:55:28.512', 0, NULL),
      ('cmnlo43tx000001mwrogub38j', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'i hope u jump off a bridge', true, false, '2026-04-05 11:18:15.909', '2026-04-05 23:26:27.141', 0, NULL),
      ('cmnmlh67i000101pcj055mxvo', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'yes', false, false, '2026-04-06 02:52:12.846', '2026-04-06 08:53:15.408', 0, NULL),
      ('cmnjtevzz000201pgsonnwh4o', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'Hey guys! I recently migrated all database data to the new Quacky!

Hopefully everything is here. You may notice that some UI elements and APIs have changed....', false, false, '2026-04-04 04:11:04.703', '2026-04-06 08:53:18.963', 0, NULL),
      ('cmnpxn0lx000001la06ho9fqq', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'stfu no one cares.', true, false, '2026-04-08 10:55:59.445', '2026-04-08 10:58:00.538', 0, NULL),
      ('cmnzm4hgq000301la6jt3edfg', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'kys', true, false, '2026-04-15 05:31:20.810', '2026-04-15 05:31:45.469', 0, NULL),
      ('cmn9wb7zm000201phdw6xnqjz', '1f9e44a1-9624-4fe2-bd26-5fee16f5c829', 'I love cracking crackers', false, false, '2026-03-28 05:34:30.706', '2026-04-16 09:59:35.471', 1, NULL),
      ('cmnzm2je4000201lagdztz9zq', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'Dms are now here :)

UI is still a wip, however its very usable.

Posts, Shorts will be reworked next.', false, false, '2026-04-15 05:29:49.996', '2026-04-16 09:49:32.158', 0, NULL),
      ('cmmus2i60000e0iqztdlduav1', 'ae42bbe6-0864-49f8-bf8d-76dc61b4ac8f', 'Dang bro is cooking with this, is there a description? also how can I get verified', false, false, '2026-03-17 15:39:12.888', '2026-05-11 23:21:10.878', 1, NULL),
      ('cmmro3wgn000b0iqzer8sm3vc', '0b9a301c-391e-4002-a5ec-aefa9671cf67', 'ooo scary', false, false, '2026-03-15 11:25:01.079', '2026-03-15 11:25:01.079', 0, NULL),
      ('cmmrgl9mv00030iqzjp9wbbtq', '2e0dd57a-4817-4ca4-b519-72b981e778d1', 'A great image :)', false, false, '2026-03-15 07:54:34.375', '2026-03-15 07:54:34.375', 0, NULL),
      ('cmo48un59000201n6qscj2193', 'iodXnSu0v7pCS4O9hVcSZVECy2EYVESv', 'kys', true, false, '2026-04-18 11:18:37.485', '2026-04-18 11:19:18.853', 1, NULL),
      ('cmo0zyqfg000001tfin0e3e6w', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '#cool', false, false, '2026-04-16 04:46:33.292', '2026-04-16 09:49:12.298', 1, NULL),
      ('cmoh5g2xg000h01qv8chob7pz', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '@user-3367727 is NOT a #cool-guy', true, false, '2026-04-27 12:04:19.540', '2026-05-06 04:13:45.855', 1, NULL),
      ('cmo24b9zf000901o4suxhjkj3', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '@hellohello go to https://kys.com', true, false, '2026-04-16 23:36:03.147', '2026-04-16 23:36:43.114', 1, NULL),
      ('cmo6gupom000101n6ls4leb4i', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '# Update 0.0.3
@mentions are now here. You can now mention people using @linus

#hashtags have been released!

This version is currently in beta.', false, true, '2026-04-20 00:38:10.054', '2026-05-06 04:21:18.226', 1, NULL),
      ('cmo24ii3k000b01o4xlrppahf', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '@hellohello test', true, false, '2026-04-16 23:41:40.256', '2026-05-06 04:16:08.242', 0, NULL),
      ('cmo48yiyx000a01n6bigxc4e0', 'iodXnSu0v7pCS4O9hVcSZVECy2EYVESv', 'Hey linus this is a #cool profile', false, false, '2026-04-18 11:21:38.697', '2026-04-18 11:21:38.697', 0, NULL),
      ('cmo6gtl6t000001n66detcnsc', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'Kys', true, false, '2026-04-20 00:37:17.573', '2026-04-20 00:37:41.324', 1, NULL),
      ('cmoh1o63d000201qv2slzxbjq', '2XFtbYSxVlWSOb2vPYIu2h2n4L3eVpCQ', 'Hi guys', false, false, '2026-04-27 10:18:38.425', '2026-04-27 12:36:12.959', 1, NULL),
      ('cmoh6hnnh000i01qvyo7vmx1i', '0vfOWYLnBq4yL1SiF5qYHBOpT5xHfrK6', 'hello there i am pikachu and i liek ketchup and pika pi', false, false, '2026-04-27 12:33:32.669', '2026-04-27 19:11:44.940', 2, NULL),
      ('cmo28n4uf00015szfdhm2tn1z', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'lol', false, false, '2026-04-17 01:37:14.823', '2026-05-01 22:11:00.847', 0, NULL),
      ('cmo28l54300005szfsu864f4o', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'wowwwwwww', false, false, '2026-04-17 01:35:41.858', '2026-05-01 22:11:17.841', 0, NULL),
      ('cmoh5fb58000f01qvrilm9mhk', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '#scapulas', true, false, '2026-04-27 12:03:43.531', '2026-05-06 04:13:49.629', 1, NULL),
      ('cmo48y0kw000901n642u859hk', 'iodXnSu0v7pCS4O9hVcSZVECy2EYVESv', '@linus  hi', false, false, '2026-04-18 11:21:14.864', '2026-05-06 04:19:09.853', 1, NULL),
      ('cmo26d3r4000001n6rn75xqwi', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '# Warm Fuzzy Bags have been released!

Send a kind message to brighten someone''s day at https://quacky.space/fuzzies', false, true, '2026-04-17 00:33:27.616', '2026-05-06 04:20:07.564', 0, NULL),
      ('cmmus57j9000i0iqz67yyh6zy', 'c63e816b-3cb8-450e-8e03-2a5f8c81f9e7', 'this is my cat y''all! meet coco!', false, false, '2026-03-17 15:41:19.077', '2026-05-11 23:17:42.858', 1, NULL),
      ('cmol0hsro000101o38zfcnr3h', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'Im so cool right', true, false, '2026-04-30 04:56:46.308', '2026-05-03 07:51:51.885', 0, NULL),
      ('cmokigm60000001r0lw09n69p', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'Excited for next #update guys?', false, true, '2026-04-29 20:31:58.008', '2026-05-06 04:23:59.488', 1, NULL),
      ('cmola5tju000001oce3ezrni1', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '@johndoee i hate u kys', true, false, '2026-04-30 09:27:23.610', '2026-04-30 09:27:47.522', 1, NULL),
      ('cmo1arhia000001o40mgr6b7w', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '# v0.0.2 has shipped!

Admin panel & AI moderation tools
Video Shorts, DMs & Notifications
Bookmarks, Quotes, Mentions/Hashtags
Post views, Trends & Follows
Nested replies
Enhanced profiles (banners/customization)
Help/Legal pages

View at https://lkang.au/quacky

#releasenotes', false, true, '2026-04-16 09:48:50.914', '2026-05-06 04:28:22.523', 3, NULL),
      ('cmomvu1tv000001tk1z7e30zh', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '#scapulas @user-3367727', true, false, '2026-05-01 12:21:52.194', '2026-05-01 12:22:02.066', 0, NULL),
      ('cmomrrdkw000001qbh0b0xxbt', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'test', true, false, '2026-05-01 10:27:48.992', '2026-05-01 12:22:06.131', 0, NULL),
      ('cmol6nr82000601ocqab5fbsv', 'u4m3iQqDZy03qDaHqbdd5bJgT5KyKrwQ', '@linus hello there nice #app', true, false, '2026-04-30 07:49:21.938', '2026-05-01 10:27:24.866', 1, NULL),
      ('cmokup5cz000001o3uln5hwhd', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'test', true, false, '2026-04-30 02:14:31.523', '2026-05-01 12:22:11.944', 0, NULL),
      ('cmomuwgda000601o3f028rdcc', 'test', 'sigma sigma skibidi 67777777777777777776767676767676767676767

yaaaa', false, true, '2026-05-01 11:55:44.734', '2026-05-01 21:52:27.282', 0, NULL),
      ('cmomw0mps000101tkxfjmaiek', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'poop', false, false, '2026-05-01 12:26:59.200', '2026-05-01 12:26:59.200', 0, NULL),
      ('cmomuo06k000001o3y67ap43a', 'test', 'sigma', false, false, '2026-05-01 11:49:10.508', '2026-05-04 21:11:16.942', 2, NULL),
      ('cmol6myul000501ocv534ylil', 'u4m3iQqDZy03qDaHqbdd5bJgT5KyKrwQ', 'which one?', true, false, '2026-04-30 07:48:45.165', '2026-05-06 04:12:17.260', 2, NULL),
      ('cmok2bel2000101r0kz66j3hw', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'what would u rather??', true, false, '2026-04-29 13:00:01.046', '2026-05-06 04:15:25.789', 2, NULL),
      ('cmok2agre000001r072wua07e', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'lmao', false, false, '2026-04-29 12:59:17.210', '2026-04-29 12:59:17.210', 0, NULL),
      ('cmo0zs9ka000101tfbh95misw', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'More profile settings and banners are now here', false, false, '2026-04-16 04:41:31.498', '2026-04-16 09:49:42.125', 0, NULL),
      ('welcome', 'quacky', 'Welcome to Quacky, the simple and open social media platform for teens.', false, false, '2026-03-04 12:50:46.000', '2026-04-17 00:32:26.990', 1, NULL),
      ('cmonhlnbt000001rru71h2vw8', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '', false, false, '2026-05-01 22:31:11.705', '2026-05-01 22:31:42.639', 0, NULL),
      ('cmonhpvc5000101rrvrei8asu', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '23', true, false, '2026-05-01 22:34:28.709', '2026-05-03 07:51:31.267', 0, NULL),
      ('cmonh1gi2000001qyr42dcqgs', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'hu', true, false, '2026-05-01 22:15:29.738', '2026-05-03 07:51:33.834', 0, NULL),
      ('cmot2oytn000401p8yqcx0ljv', 'u4m3iQqDZy03qDaHqbdd5bJgT5KyKrwQ', 'I IDENtiFY AS AN OBKECT OKAY', true, false, '2026-05-05 20:20:29.387', '2026-05-06 04:11:57.794', 0, NULL),
      ('cmotk5zsr000f01p85vybte5g', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', '# A new #update will be dropping next month!
It may include a game... ?', false, false, '2026-05-06 04:29:37.275', '2026-05-06 04:29:37.275', 0, NULL),
      ('cmp6tgmmu000301obuqswk736', 'Q2LxhdxwHu6JlYSnTMyyfIptOthI2SAu', 'We''ve recently migrated our AI moderation infrastructure from Ollama server & a custom FastAPI implementation to Cloudflare Workers AI, it should run much faster now.', false, false, '2026-05-15 11:10:50.262', '2026-05-15 11:10:50.262', 0, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "attachment" (
    id, "postId", name, url, type, "createdAt"
) VALUES
      ('1db35add-6b98-4f7a-a06f-79453c8e2901', 'cmmre4vgu00000iqzj7m6y7e1', 'parrot.gif', 'https://cdn.quacky.space/quacky/parrot.gif', 'image', '2026-03-15 06:45:50.286'),
      ('5fa6f9cc-4e46-4207-b999-21c441727947', 'cmnjqcjmh000001pgxrfvhgmc', 'parrot.gif', 'https://cdn.quacky.space/quacky/posts/t9lEV5w9kq3fIrwuj4rhMosZLJbYHu9b/1775270710423-cg7lop2oy5.gif', 'image', '2026-04-04 02:45:16.505'),
      ('e1bc2a0b-86c6-4c06-b76d-2799de0c8697', 'cmnjtevzz000201pgsonnwh4o', 'quackylogo.png', 'https://quackycdn.linus.my/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1775275861634-24pqms2w63a.png', 'image', '2026-04-04 04:11:04.703'),
      ('cb03b963-d59f-48a4-998e-8c798a75b149', 'cmn9wb7zm000201phdw6xnqjz', 'Screenshot-2026-03-28-153402.png', 'https://cdn.quacky.space/quacky/posts/migrate/posts/1774676063353-3gft4l2z8ci.png', 'image', '2026-03-28 05:34:30.706'),
      ('c2359002-8ff2-4393-af4e-b69392f964a3', 'cmmro3wgn000b0iqzer8sm3vc', 'Screenshot-2026-03-09-095206.png', 'https://cdn.quacky.space/quacky/posts/migrate/posts/1773573894602-pfpip0csdm.png', 'image', '2026-03-15 11:25:01.079'),
      ('bbf563d2-1a0d-4b4a-8e52-2abd76fee6d5', 'cmmrgl9mv00030iqzjp9wbbtq', 'my_fav.png', 'https://cdn.quacky.space/quacky/posts/migrate/posts/1773561270239-wykmndev91.png', 'image', '2026-03-15 07:54:34.375'),
      ('124fa6f9-b31e-4af3-b7fa-64552534e235', 'cmo28n4uf00015szfdhm2tn1z', 'Animated_Poop_Evades_Police_Car-1-.mp4', 'http://localhost:9000/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1776389834076-8wzblzjl9ze.mp4', 'video', '2026-04-17 01:37:14.823'),
      ('3d0f4b8c-87c2-4f9d-9f42-04a639fd612c', 'cmo28l54300005szfsu864f4o', '20000940-hd_1080_1920_30fps.mp4', 'http://localhost:9000/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1776389741127-ujai7plvsn.mp4', 'video', '2026-04-17 01:35:41.858'),
      ('5361e2ac-b146-44be-98b9-e56d600b35b4', 'cmmus57j9000i0iqz67yyh6zy', 'WhatsApp-Image-2026-03-15-at-23.10.02.jpeg', 'https://cdn.quacky.space/quacky/posts/migrate/posts/1773762075498-eut8vcreglk.jpeg', 'image', '2026-03-17 15:41:19.077'),
      ('cf38098d-16bf-4569-ac9c-59d727f38e25', 'cmmus57j9000i0iqz67yyh6zy', 'WhatsApp-Image-2026-03-15-at-23.10.02.jpeg', 'https://cdn.quacky.space/quacky/posts/migrate/posts/1773762076215-30cqkqo6xzw.jpeg', 'image', '2026-03-17 15:41:19.077'),
      ('78048a95-e9ec-4de2-9084-ac577891e501', 'cmokigm60000001r0lw09n69p', '20000940-hd_1080_1920_30fps.mp4', 'https://cdn.quacky.space/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1777494713945-4gv8smtenl4.mp4', 'video', '2026-04-29 20:31:58.008'),
      ('67d4343c-1fcd-4916-9260-75fd918f2277', 'cmo1arhia000001o40mgr6b7w', 'Picture2.png', 'https://cdn.quacky.space/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1776332906430-vnzkbllmho.png', 'image', '2026-04-16 09:48:50.914'),
      ('8d7652a8-2d53-4ea6-b411-8d4c3b4ce823', 'cmomw0mps000101tkxfjmaiek', 'Animated_Poop_Evades_Police_Car-1-.mp4', 'https://cdn.quacky.space/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1777638418027-wdsjo5k7uz.mp4', 'video', '2026-05-01 12:26:59.200'),
      ('3bd538eb-272d-42f4-872a-76fb20e6e373', 'cmomuo06k000001o3y67ap43a', 'screenshot_6-2-2026_111112_www.bing.com.jpeg', 'https://cdn.quacky.space/quacky/posts/test/1777636148109-nk38v3ab5w.jpeg', 'image', '2026-05-01 11:49:10.508'),
      ('8756db6b-dba7-46fd-bb67-2461e97e761f', 'cmok2agre000001r072wua07e', 'WhatsApp-Video-2026-03-02-at-14.24.42.mp4', 'https://cdn.quacky.space/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1777467556338-nxg7s46dfp.mp4', 'video', '2026-04-29 12:59:17.210'),
      ('9cee0e17-2de0-4a3b-a9c6-a44c1068c482', 'cmo0zs9ka000101tfbh95misw', 'Screenshot-2026-04-16-144113.png', 'https://cdn.quacky.space/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1776314490201-q4snkn1t2ao.png', 'image', '2026-04-16 04:41:31.498'),
      ('77e36823-87b3-433e-8e2f-1a75a34e6755', 'welcome', 'parrot.gif', 'https://cdn.quacky.space/quacky/parrot.gif', 'image', '2026-03-04 12:50:46.000'),
      ('7903e0a9-868c-43ea-99bf-5d78c5129ef6', 'cmonhlnbt000001rru71h2vw8', '20000940-hd_1080_1920_30fps.mp4', 'https://cdn.quacky.space/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1777674655510-63okk78ayt9.mp4', 'video', '2026-05-01 22:31:11.705'),
      ('59f20f87-7b01-4d0f-946a-49c56cb91ca1', 'cmonhlnbt000001rru71h2vw8', 'war_footage.mp4', 'https://cdn.quacky.space/quacky/posts/8558fae6-9b02-4c57-80b4-73604c359c13/1777674662679-xqaoy58suy.mp4', 'video', '2026-05-01 22:31:11.705')
ON CONFLICT (id) DO NOTHING;

COMMIT;
