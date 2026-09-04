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

import { pino, type Logger } from "pino"

import { env } from "@/env"

const BATCH_SIZE = 25
const FLUSH_INTERVAL_MS = 2_000

const SEQ_LEVELS: Record<number, string> = {
    10: "Verbose",
    20: "Debug",
    30: "Information",
    40: "Warning",
    50: "Error",
    60: "Fatal",
}

interface PinoLine {
    level?: number
    time?: number
    msg?: string
    [key: string]: unknown
}

// Maps pino's NDJSON output to Seq's CLEF format.
// https://docs.datalust.co/docs/posts/raw-logs
function toClef(line: string): string {
    try {
        const { level, time, msg, ...props } = JSON.parse(line) as PinoLine
        const err = props.err as { stack?: string } | undefined

        return JSON.stringify({
            "@t": new Date(time ?? Date.now()).toISOString(),
            "@mt": msg ?? "log entry",
            "@l": SEQ_LEVELS[level ?? 30] ?? "Information",
            ...(err?.stack ? { "@x": err.stack } : {}),
            ...props,
        })
    } catch {
        return JSON.stringify({
            "@t": new Date().toISOString(),
            "@mt": line,
        })
    }
}

interface LoggerInstance {
    logger: Logger
    flush: () => Promise<void>
}

function createLogger(): LoggerInstance {
    const url = env.SEQ_INGEST_URL
    const apiKey = env.SEQ_API_KEY

    // SEQ vars can be undefined when env validation is skipped (e.g. CI)
    if (!url || !apiKey) {
        return {
            logger: pino({ base: { service: "quacky" } }),
            flush: () => Promise.resolve(),
        }
    }

    const endpoint = url.endsWith("/api/events/raw")
        ? url
        : `${url.replace(/\/+$/, "")}/api/events/raw`

    let buffer: string[] = []
    let inflight: Promise<void> | null = null

    async function flush(): Promise<void> {
        if (buffer.length === 0) return
        if (inflight) return inflight

        const batch = buffer.join("\n")
        buffer = []

        inflight = fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/vnd.serilog.clef",
                "X-Seq-ApiKey": apiKey,
            },
            body: batch,
        })
            .then(async (res) => {
                if (!res.ok) {
                    console.error(
                        `[logger] seq ingestion failed with ${res.status}: ${await res.text()}`
                    )
                }
            })
            .catch((error) => {
                console.error("[logger] failed to ship logs to seq:", error)
            })
            .finally(() => {
                inflight = null
            })

        return inflight
    }

    const timer = setInterval(() => void flush(), FLUSH_INTERVAL_MS)
    timer.unref()

    return {
        logger: pino(
            { base: { service: "quacky" } },
            {
                write(line: string) {
                    buffer.push(toClef(line))
                    if (buffer.length >= BATCH_SIZE) void flush()
                },
            }
        ),
        flush,
    }
}

// Guard against duplicate instances (and stacked flush intervals) during dev HMR
const globalForLogger = globalThis as unknown as {
    quackyLogger?: LoggerInstance
}

const instance = globalForLogger.quackyLogger ?? createLogger()
globalForLogger.quackyLogger = instance

export const logger = instance.logger
export const flushLogs = instance.flush
