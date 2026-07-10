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

// Libraries
import axios from "axios"
import { useState, useEffect } from "react"
import { toast } from "sonner"

// Components
import {
    Widget,
    WidgetSecondaryHeader,
    WidgetContent,
} from "@/components/widgets/widget"

export function QOTD() {
    const [qotd, setQotd] = useState<string | null>("")

    useEffect(() => {
        async function fetchQOTD() {
            try {
                await axios.get('/api/meta').then((res) => {
                    setQotd(res.data.qotd)
                })
            } catch {
                toast.error("Something went wrong")
            }
        }
        fetchQOTD()
    }, [])
    return (
        <Widget>
            <WidgetSecondaryHeader>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-lg font-bold">Quote of the Day</h1>
                    </div>
                </div>
            </WidgetSecondaryHeader>
            <WidgetContent>
                <p className="text-sm text-muted-foreground italic">
                    {qotd}
                </p>
            </WidgetContent>
        </Widget>
    )
}