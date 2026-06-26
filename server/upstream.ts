import { Action, Field, TimelineEvent, Upstream } from "upstream-sdk";
import { env } from "@/env";

const up = new Upstream(env.UPSTREAM_API_KEY)

type EventProps = {
    title: string;
    icon: string;
    createdAt?: string;
    content?: string;
    category?: string;
    fields?: Field[];
    events?: TimelineEvent[];
    data?: unknown;
    actions?: Action[];
}

export class Up {
    static async ingest(event: EventProps) {
        const res = await up.events.ingest(
            event,
        )

        return res
    }
}