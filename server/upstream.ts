//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import { Upstream, type EventContext } from "@uplabs/sdk"
import { env } from "@/env"

const up = new Upstream({
    apiKey: env.UPSTREAM_API_KEY,
})

type LegacyField = {
    name: string
    value: string
}

type LegacyAction = {
    title: string
    url: string
    type?: "default" | "primary" | "secondary" | "ghost"
}

type EventProps = {
    title: string
    icon?: string
    content?: string
    category?: string
    fields?: LegacyField[]
    actions?: LegacyAction[]
    data?: unknown
}

const VARIANTS: Record<string, "primary" | "secondary" | "ghost"> = {
    default: "primary",
    primary: "primary",
    secondary: "secondary",
    ghost: "ghost",
}

function toEventContext(event: EventProps): EventContext {
    return {
        title: event.title,
        icon: event.icon,
        description: event.content,
        category: event.category,
        fields: event.fields?.map((field) => ({
            title: field.name,
            value: field.value,
        })),
        actions: event.actions?.map((action) => ({
            title: action.title,
            url: action.url,
            variant: VARIANTS[action.type ?? "default"] ?? "primary",
        })),
        data: event.data,
    }
}

export class Up {
    static async ingest(event: EventProps) {
        return up.events.ingest(toEventContext(event))
    }
}
