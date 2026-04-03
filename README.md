# Quacky: Simple and Open Social Media

Quacky is a bootstrapped social media platform built in Next.js, designed for teens.

We are currently in the development phase. Expect bugs and APIs to change overtime with little to no warning.

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

You can self-host Quacky using this ``docker-compose.yml`` file:

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
    ports:
      - "3001:3000"

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
