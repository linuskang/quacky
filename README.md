<p align="center">
  <img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/22a06755-c0c6-4d8f-8e95-79d8fbc534e8" />
</p>

<h1 align="center">Quacky: Social media platform</h1>

## Introduction

Hello, thanks for visiting my project. I built Quacky, a social media edutainment platform for teens. It is part of a broader development I'm programming over the next couple of months for my school.

i dont really feel like yapping on this readme, so if you want to see the issue im trying to solve with my solution, check out the devlogs at https://quacky.space/devlog, there ive been documenting my entire journey making this app.

as of now when your visiting this shipped, I've finished the 1st stage of development, which consists of the core platform features:
- Posting, Liking, Commenting, Bookmarks, Share, Repost, Quoting, Views

Along with that:
- Warm Fuzzies
- Quizzes
- Daily Check In
- DMs
- Trending
- Shop
- User profiles
- notifications
- more features i dont feel like listing. check them out on the [devlogs](https://quacky.space/devlog).

## selfhosting for prod

i use docker compose with this repository, and webhooks which automatically deploys the ``docker-compose.yml`` and builds my code to my VPS using portainer.

for you, try out this:

```yml
services:
  app:
    image: ghcr.io/linusdotmy/quacky:latest
    restart: unless-stopped
    env_file: .env
    ports:
      - "5374:3000"
    depends_on:
      - db
      - cdn
    networks:
      - quacky_network
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - quacky_db_data:/var/lib/postgresql/data
    ports:
      - "5731:5432"
    networks:
      - quacky_network
  cdn:
    image: rustfs/rustfs:latest
    restart: unless-stopped
    environment:
      - RUSTFS_ACCESS_KEY=${RUSTFS_USER}
      - RUSTFS_SECRET_KEY=${RUSTFS_PASSWORD}
    volumes:
      - quacky_s3_data:/data
    command: /data
    networks:
      - quacky_network
    ports:
      - "5372:9001"
volumes:
  quacky_db_data:
  quacky_s3_data:
networks:
  quacky_network:
    driver: bridge
```

ensure that you've configured your ``.env`` file, and run the prisma migrations.

after, just run compose up when your finished:

```bash
docker compose up
```

## hate docker?

weirdo... but ok. you'll need to figure out how to get postgres and rustfs running yourself 😭

1. double check your env is all set.

2. deploy the app using ``npm run start``

3. grab a fire extinguisher

i wish you luck 😎

~ linus

## credits

- Project coded by [Linus Kang](https://github.com/linuskang).
- Goose Mascots by [Queensland Academies for Creative Industries](https://qaci.eq.edu.au), used with permission.
- Logo Artwork & Various goose remixes by [My Sister](https://sushi.kang.software).

this project is governed under the CC BY-NC 4.0 license. see the [license](LICENSE).

### good reads
- Edelson, L., Haugen, F., & McCoy, D. (2025). A Comparative Survey Of Algorithmic Feed Recommendation System Designs. ACM Transactions on Recommender Systems. https://doi.org/10.1145/3757327

### AI declarations

See [ai.md](AI.MD) for declarations