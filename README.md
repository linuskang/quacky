# Quacky: Simple and Open Social Media

Quacky is a bootstrapped social media platform built in Next.js, designed for teens.

We are currently in the development phase. Expect bugs and APIs to change overtime with little to no warning.

### Try quacky at https://quacky.linus.my

## Tech stack

Quacky is built with:

- Next.js
- Better Auth
- Prisma ORM
- Postgresql
- RustFS

3rd party services:

- Resend
- Github OAuth

## Self-host

1. Pull the image

```bash
docker pull linuskang/quacky:latest
```

2. Self-host Quacky using this ``docker-compose.yml`` file:

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

Ensure you have your ``.env`` file set with the following variables:

```env
DATABASE_URL=""

S3_ENDPOINT=""
S3_BUCKET_NAME=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_REGION=""

BETTER_AUTH_SECRET=""
BETTER_AUTH_URL=""
BETTER_AUTH_TRUSTED_ORIGINS=""

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

RESEND_API_KEY=""
EMAIL_FROM=""

DISCORD_WEBHOOK_URL=""

APP_VERSION="0.0.1"
APP_BUILD="production"
```

You can now start Quacky:

```bash
docker compose up
```

Next, you will need to apply database migrations, add a config entry, and create the default **@quacky** user.

```bash
npx prisma migrate dev
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

And.. your done! Access Quacky at [localhost:3001](http://localhost:3001) and create an account.

### Updating Quacky

All you have to do when updating your Quacky instance is to pull the image, and restart the docker containers.
