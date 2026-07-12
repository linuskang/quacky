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

import { PageLayout, PageCenter } from "@/components/page-layout"
import { Title } from "@/components/text"
import { Fuzzies } from "@/components/fuzzies"
import { requireSession } from "@/server/auth"
import { Fuzzy } from "@/server/fuzzy"
export default async function FuzziesPage() {
    const session = await requireSession()

    await Fuzzy.markAllAsRead(session.user.id)

    return (
        <PageLayout>
            <PageCenter>
                <Title>Warm Fuzzies</Title>
                <Fuzzies />
            </PageCenter>
        </PageLayout>
    )
}
