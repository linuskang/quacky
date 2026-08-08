# Contributing

> [!NOTE]
> This guide isn't done yet and is still being worked on. I've tried my best to get everything you need to start tinkering with Quacky here but there might be some stuff missing. Apologies.

## Upstream App: Setting up dev environment

Clone the repository:

```bash
git clone https://github.com/linuskang/quacky
```

Enter and install dependencies:

```bash
cd quacky
npm i
```

Declare ``.env`:

```bash
cp .env.example .env # edit the values to be yours
```

Run prisma migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

And lastly, start the server:

```bash
npm run dev
```

Upstream will be available at http://localhost:3000

## Packages

1. Clone the repo
2. ``npm install``
3. Start tinkering
4. When your done, run ``npm run build`` and ``npm run lint`` to check for errors.
5. Your done! create a pr if you wish.

## Contribution notes

Please note that I am not actively seeking community contributions. This repository is currently a source only distribution of my work whilst I am building my vision of what I want Quacky to be like.

I may consider accepting contributions from the community eventually after I exit beta, however, that's a later point to discuss.

If you have any issues or general feedback, feel free to create an issue and I will review it.