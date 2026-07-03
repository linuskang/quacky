<p align="center">
  <img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/22a06755-c0c6-4d8f-8e95-79d8fbc534e8" />
</p>

<h1 align="center">Quacky: Social media platform</h1>

## Introduction

Hello, thanks for visiting my project. I built Quacky, a social media platform for teens. It is part of a broader development I'm programming over the next couple of months for my school.

As of now when your visiting this shipped, I've finished the 1st stage of development, which consists of the core Social media features that you would expect on a platform. For example:
- Posting, Liking, Commenting, Bookmarks, Share, Repost, Quoting, Views

Along with that, there are other features like:
- Warm Fuzzies (u will see what they are in the app!)
- Daily Check In (for students to check in daily. This is anonymous feedback that is shown to admins and school staff for reflections).
- Emotion Wheel (stage 1, will have more soon but essentially this part of the app is for resources to help students wellbeings)
- DMs (encrypted, however if a student reports something as inappropriate, they can pick which text was offending and staff can look at it).
- Trending
- Shop (for future development, however it works right now!)
- User profiles (Badges, XP, Followers, Verified check, Admin badge, Display name, avatar image, banner, u get the gist.)
- And notifications (i also use these for announcements and when the AI flags your post, when reported by another user!)

This is just V1, theres more coming soon regarding wellbeing stuff, however I wanted to get all of the core features done first. **The artworks inside the app are made by my [sister](https://sushi.kang.software)!**

## Interested in self-hosting?

i use docker for everything. its amazing.

You can easily get started using this compose file:

```yml
services:
  app:
    container_name: quacky
    image: ghcr.io/joinquacky/quacky:latest
    restart: unless-stopped
    env_file: .env
    ports:
      - "5732:3000"
    networks:
      - quacky_net
  db:
    container_name: quacky-db
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: quacky
      POSTGRES_PASSWORD: quacky
      POSTGRES_DB: quacky
    volumes:
      - quacky_data:/var/lib/postgresql/data
    ports:
      - "5731:5432"
    networks:
      - quacky_net
volumes:
  quacky_data:
networks:
  quacky_net:
    driver: bridge
```

**Access quacky at port 5732**. Just know that you will need to apply the prisma migrations beforehand as I haven't made that automated yet.

## are you a docker hater?

weirdo... but ok. you'll need to figure out how to get postgres and rustfs running yourself bro 😭

1. double check your env is all set.

2. deploy the app using ``npm run start``

3. grab a fire extinguisher and prepare for meltdown

good luck 🥀

-- linus

## license

this project is governed under the CC BY-NC 4.0 license. see the [license](LICENSE) file for more information.

## credits

Project by [LInus Kang](https://github.com/linuskang). Artwork by [my sister](https://sushi.kang.software).

For any questions, send them to linus@linus.my.