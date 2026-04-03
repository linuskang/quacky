import prisma from "@/server/db";

interface ConfigEntry {
    key: string;
    value: any;
    createdAt: Date;
    updatedAt: Date;
}

export default class Config {
    static async get(keyId: string) {
        const config = await prisma.config.findUnique({
            where: {
                key: keyId,
            },
        });

        return config?.value as ConfigEntry | null;
    }
}
