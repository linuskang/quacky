import "server-only";

import { prisma } from "@/server/prisma";

export async function getUser(handle: string) {

    const user = await prisma.user.findUnique(
        {
            where: {
                username: handle,
            },
            include: {
                following: {
                    select: {
                        follow: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
                followers: {
                    select: {
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        }
    )

    if (!user) {
        return null;
    }

    const following = user.following.map(({ follow }) => follow.username);
    const followers = user.followers.map(({ user }) => user.username);

    return {
        ...user,
        following,
        followers,
    }
}

export async function getUserById(id: string) {

    const user = await prisma.user.findUnique(
        {
            where: {
                id,
            },
            include: {
                following: {
                    select: {
                        follow: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
                followers: {
                    select: {
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        }
    )

    if (!user) {
        return null;
    }

    const following = user.following.map(({ follow }) => follow.username);
    const followers = user.followers.map(({ user }) => user.username);

    return {
        ...user,
        following,
        followers,
    }
}

export async function addXP(handle: string, increase: number) {
    const user = await getUser(handle);

    if (!user) {
        return null;
    }

    const xp = user.xp + increase;

    await prisma.user.update({
        where: {
            username: handle,
        },
        data: {
            xp
        }
    })

    return true

}

export async function addPoints(handle: string, increase: number) {
    const user = await getUser(handle);

    if (!user) {
        return null;
    }

    const points = user.points + increase;

    await prisma.user.update({

        where: {
            username: handle,
        },

        data: {
            points
        }
    })

    return true
}

export async function removePoints(handle: string, decrease: number) {
    const user = await getUser(handle);

    if (!user) {
        return null;
    }

    let points = user.points - decrease;

    if (points < 0) {
        points = 0
    }

    await prisma.user.update({
        where: {
            username: handle,
        },
        data: {
            points
        }
    })

    return true;
}

export async function removeXP(handle: string, decrease: number) {
    const user = await getUser(handle);

    if (!user) {
        return null;
    }

    let xp = user.xp - decrease;

    if (xp < 0) {
        xp = 0
    }

    await prisma.user.update({
        where: {
            username: handle,
        },
        data: {
            xp
        }
    })

    return true
}

export async function unlockPosting(handle: string) {
    const user = await getUser(handle);

    if (!user) {
        return null;
    }

    await prisma.user.update({
        where: {
            username: handle,
        },
        data: {
            unlockedPosting: true
        }
    })

    console.log(`Unlocked posting for ${handle}`)

    return true
}

export async function unlockCommenting(handle: string) {
    const user = await getUser(handle);

    if (!user) {
        return null;
    }

    await prisma.user.update({
        where: {
            username: handle,
        },
        data: {
            unlockedCommenting: true
        }
    })

    return true
}

export async function unlockDms(handle: string) {
    const user = await getUser(handle);

    if (!user) {
        return null;
    }

    await prisma.user.update({
        where: {
            username: handle,
        },
        data: {
            unlockedDms: true
        }
    })

    return true
}

export async function unlockFuzzies(handle: string) {
    const user = await getUser(handle);

    if (!user) {
        return null;
    }

    await prisma.user.update({
        where: {
            username: handle,
        },
        data: {
            unlockedFuzzies: true
        }
    })

    return true
}

export async function unlockProfiles(handle: string) {
    const user = await getUser(handle);

    if (!user) {
        return null;
    }

    await prisma.user.update({
        where: {
            username: handle,
        },
        data: {
            unlockedProfiles: true
        }
    })

    return true
}