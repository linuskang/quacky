# Quacky: Simple and Open Social Media, with some quirks..

Quacky is a bootstrapped social media platform built in Next.js, built from scratch, designed for teens.

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

### Try out Quacky at https://quacky.linus.my

## Tech stack

Quacky is built with:

- Next.js
- Better Auth
- Prisma ORM
- Postgres
- RustFS
- Ollama
- Resend

## Why does Quacky even exist?

Online safety websites go a long way back. There are already plenty designed to teach kids how to stay safe online. But why does mine exist?

Well... I believe that conventional educational games follow these core beliefs:

- Education occurs through instruction and practice
- Videogames are natural vessels for instruction and practice
- Therefore, videogames are natural vessels for Education

Games have already advanced far from where it once was, from simple physical games like Monopoly, to Minecraft & Roblox, some of the world's best-selling games ever.

However, as a teen, I firmly believe that the current edutainment industry focuses too heavily on compliance for teachers & parents, whereas real, enjoyable, and fun games are built for student agency and enjoyment. There are already plenty of games for learning how to private your social media accounts, blocking users, reporting using the built in tools, the list goes on...

Ironically, the strongest evidence of *education through play* has occured through the gaming entertainment industry. These educational games are effective because they don't place teaching as the main objective. Instead, they are so effective because: when a player loses themselves in Minecraft's redstone circuitry or Roblox's endless game library, they naturally learn from play. Cultural phenomena like these games have become the entertainment sector's most compelling argument for what educational software & games have long promised but struggled to deliver.

A great quote believe summarises the entire state of edutainment that *"We contend that educational games fail to deliver because the incentives of this market sector contradict the very nature of what a game should be." - Hackclub*

Quacky, and it's suite of games & apps are built around the key mechanic of *learning through play*. We have built a fully functional social media game for teens to play around and learn from.

## Self-host

1. Pull the image

```bash
docker pull linuskang/quacky:latest
```

2. Edit this ``docker-compose.yml`` file:

```yml
services:
  quacky:
    container_name: quacky
    image: linuskang/quacky:latest
    restart: always
    env_file:
      - .env
    depends_on:
      - db
      - cdn
    networks:
      - quacky_network
    ports:
      - "3001:3001"

  db:
    container_name: quackydb
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: quacky
      POSTGRES_PASSWORD: quacky
      POSTGRES_DB: quackydb
    volumes:
      - quacky_db_data:/var/lib/postgresql/data
    networks:
      - quacky_network
    ports:
      - "15432:5432"

  cdn:
    image: rustfs/rustfs:latest
    container_name: quackycdn
    restart: always
    environment:
      - RUSTFS_ACCESS_KEY=quacky
      - RUSTFS_SECRET_KEY=quacky
    volumes:
      - quacky_cdn_data:/data:rw
    command: server --address :9000 --console-address :9001 /data
    networks:
      - quacky_network
    ports:
      - "6000:9000"
      - "6001:9001"
    depends_on:
      - db

networks:
  quacky_network:
    driver: bridge

volumes:
  quacky_db_data:
    driver: local
  quacky_cdn_data:
    driver: local
```

Create a ``.env`` with:

```env
DATABASE_URL="postgresql://quacky:quacky@localhost:15432/quackydb"

S3_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=quacky
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=

BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

RESEND_API_KEY=""
EMAIL_FROM=""

DISCORD_WEBHOOK_URL=""

AI_SERVICES_URL=""

APP_VERSION="0.0.2"
```

Start Quacky:

```bash
docker compose up -d
```

Apply database migrations, create configuration entries, add ``@quacky`` system user:

```bash
docker exec -it quacky npx prisma migrate deploy
```

2. Create a new entry in ``Config`` table, key as ``reserved_handles`` with ``value`` being this structure:

```json
{
    "handles": [
        "quacky",
        #  Add your reserved handle names here
    ]
}
```

3. Create the Quacky admin user with ``userId``, ``name``, and ``handle`` set to ``quacky``.

Lastly, login to RustFS, create a bucket & access key. Add it into your ``.env`` configuration.

### And.. your done! Access Quacky at [localhost:3001](http://localhost:3001) and create an account.

## License

Quacky is under the CC BY-NC 4.0 license. See [LICENSE](LICENSE) for more details.

## Credits

All source code is written by Linus Kang and is governed under the repository license. Images, assets, and any other artworks displayed in Quacky are drawn by [Josephine](mailto:sushi@kang.software) for my project.
