import { env } from "@/env";

type EmbedMedia = { url: string; proxy_url?: string; height?: number; width?: number };
type EmbedAuthor = { name: string; url?: string; icon_url?: string; proxy_icon_url?: string };
type EmbedField = { name: string; value: string; inline?: boolean };

export interface DiscordEmbed {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: { text: string; icon_url?: string; proxy_icon_url?: string };
    image?: EmbedMedia;
    thumbnail?: EmbedMedia;
    author?: EmbedAuthor;
    fields?: EmbedField[];
}

export interface DiscordWebhookPayload {
    content?: string;
    username?: string;
    avatar_url?: string;
    tts?: boolean;
    embeds?: DiscordEmbed[];
    allowed_mentions?: {
        parse?: ("roles" | "users" | "everyone")[];
        roles?: string[];
        users?: string[];
        replied_user?: boolean;
    };
    components?: unknown[];
    attachments?: unknown[];
    flags?: number;
    thread_name?: string;
}

export class Discord {
    constructor(private webhookUrl: string | undefined = env.DISCORD_WEBHOOK_URL) {}

    async send(payload: DiscordWebhookPayload) {
        try {
            if (!this.webhookUrl) {
                return { success: false, error: "Discord webhook URL is not configured" };
            }

            const res = await fetch(this.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                return { success: false, error: `HTTP ${res.status}: ${text}` };
            }

            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

/** ---------- Example Usage ---------- */
// const discord = new Discord();
// discord.send({
//     content: "Hello World!",
//     embeds: [
//         { title: "Test Embed", description: "This is a test.", color: 0xff0000 }
//     ]
// });

export default Discord;
