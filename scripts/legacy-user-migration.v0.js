const { PrismaClient } = require("@prisma/client");
const fs = require("fs/promises");

const prisma = new PrismaClient();

function mapRole(role) {
    if (!role) return "user";

    const roles = {
        Member: "user",
        Admin: "admin",
        Moderator: "moderator",
    };

    return roles[role] ?? role.toLowerCase();
}

function mapUser(user) {
    return {
        id: user.id,
        name: user.name,
        username: user.username ?? user.handle,
        email: user.email,
        emailVerified: Boolean(user.emailVerified),
        image: user.image,
        verified: Boolean(user.verified),

        statsForNerds: false,
        private: Boolean(user.private ?? user.privateAccount),
        streamerMode: false,
        hideTips: false,

        bio: user.bio,
        bannerImage: user.bannerImage ?? user.banner,
        pronoun: user.pronoun ?? user.pronouns,
        location: user.location,
        website: user.website,

        role: mapRole(user.role),
        banned: Boolean(user.banned),
        banReason: user.banReason,
        banExpires: user.banExpires ? new Date(user.banExpires) : null,

        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
    };
}

async function main() {
    const file = await fs.readFile("./old-users.json", "utf8");
    const oldUsers = JSON.parse(file);

    const users = oldUsers.map(mapUser);

    await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
    });

    console.log(`Imported ${users.length} users`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });