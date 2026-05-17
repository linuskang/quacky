# Quacky: Learn Social Media

Quacky is a bootstrapped social media platform built in Next.js, from scratch, designed for schools to educate teens on responsible social mediaa use.

Features include:
- Moderation & AI tooling for admins
- Full suite of features for posting
- User profiles, including full customisations.
- Messages
- Video shorts
- Powerful user & post searching tools
- Bookmarks
- Trending algorithms, & a For You page
- Custom pages
- Custom bots
- Full learning platform for responsible social media use, XP, Badges, and tools for teachers & students to check in on school wellbeing.

**Try out the demo at https://quacky.space**

## Why does Quacky even exist?

Online safety websites go a long way back. There are already plenty designed to teach kids how to stay safe online. But why does mine exist?

Conventional educational games follow these core beliefs:

- Education occurs through instruction and practice
- Videogames are natural vessels for instruction and practice
- Therefore, videogames are the perfect candidate for Education

The strongest evidence of **_education through play_** has come from gaming. They are effective because they don't place teaching as the main objective. When a player loses themselves in Minecraft's red stone circuitry or Roblox's endless game library, they naturally learn from play.

I feel that the edutainment industry is too reliant on compliance for teachers & parents, whereas real, enjoyable, fun games are built for student agency and enjoyment. There are already plenty of games for learning how to private your social media accounts, blocking users, reporting using the built in tools, the list goes on... Player retention on these types of games don’t persist because the games don’t follow the traditional principles, one being fun to play.

A great quote that I think perfectly summarises the state of edutainment states that **_"We contend that educational games fail to deliver because the incentives of this market sector contradict the very nature of what a game should be." - HackClub_**

You might be wondering what my submission is by now to solve this issue. My app is called Quacky! An all-in-one social media application built for teens. Quacky, and it's suite of games & apps are built around the key mechanic of *learning through play*. We have built a fully functional social media game for teens to play around and learn from.

## Self-host

1. Pull the image

```bash
docker pull linuskang/quacky:latest
```

2. Edit ``docker-compose.yml`` file:

```yml
services:
  quacky:
    container_name: quacky
    image: linuskang/quacky:latest
    restart: always
    env_file:
      - .env
    networks:
      - quacky_network
    ports:
      - "3001:3001"
networks:
  quacky_network:
    driver: bridge
```

Create a ``.env`` with:

```env
# Required for storing user data
# You can either self-host a Postgres 16 database with docker,
# or get a free managed instance at https://prisma.io with up to 500mb of storage.
DATABASE_URL="postgresql://quacky:quacky@localhost:15432/quackydb"

# S3 Bucket: This is needed for profile pictures, banners, shorts, uploading.
# I recommend you to host RustFS (im using this), SeaweedFS, or use Cloudflare R2 Buckets.
S3_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=quacky
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=

# Auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"

# OAUTH
# Not required, but QOL improvement for your students/teachers.
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""

# Emails
# Required for sending logins, and other things like invites.
RESEND_API_KEY=""
EMAIL_FROM=""

# Seq Logging
# Not required
DISCORD_WEBHOOK_URL=""

# Extras: Services that you don't need, but are great addons
AI_SERVICES_URL="" # AI Moderation, https://github.com/linuskang/quacky-ai

# Dev Info
APP_VERSION="0.0.3"
```

Start Quacky:

```bash
docker compose up -d
```

**And.. your done! Access Quacky at [localhost:3000/setup](http://localhost:3000/setup) and continue to configuration.**

## License

Quacky is under the CC BY-NC 4.0 license. See [LICENSE](LICENSE) for more details.

## Credits

All source code is written by [Linus Kang](https://github.com/linuskang) and is governed under the repository license. Images, assets, and any other artworks displayed in Quacky are drawn by [Josephine](https://sushi.kang.software).
