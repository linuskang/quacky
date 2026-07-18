import { getDebugData } from "@/server/debug"

export async function Debug() {
    let data

    try {
        data = await getDebugData()
    } catch (error) {
        console.error(error)
        return null
    }

    const uptimeHours = Math.floor(data.server.uptimeSeconds / 3600) // seconds to hrs
    const uptime =
        uptimeHours >= 24
            ? `${Math.floor(uptimeHours / 24)}d ${uptimeHours % 24}h`
            : `${uptimeHours}h ${Math.floor((data.server.uptimeSeconds % 3600) / 60)}m`
    const build = data.build === "development" ? "dev" : data.build.slice(0, 8)

    return (
        <aside className="flex justify-center">
            <p className="text-[11px] text-muted-foreground/20 transition-colors hover:text-muted-foreground">
                Quacky is v{data.app.version}
                {" "}build{" "}
                <span className="font-mono">{build}</span> {" "}
                (db {" "}
                <span className="font-mono">{data.server.responseTimeMs} ms</span>) {" "}
                (Users{" "}
                <span className="font-mono">{data.database.users.toLocaleString()}</span>) {" "}
                (Posts{" "}
                <span className="font-mono">{data.database.posts.toLocaleString()}</span>) {" "}
                (Sessions{" "}
                <span className="font-mono">{data.activity.signedInUsers.toLocaleString()}</span>) {" "}
                (Memory{" "}
                <span className="font-mono">
                    {data.server.memory.usedMb}/{data.server.memory.totalMb} mb
                </span>{" "})
                (uptime <span className="font-mono">{uptime}</span>)
            </p>
        </aside>
    )
}
