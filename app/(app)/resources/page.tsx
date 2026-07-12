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

// Components
import { PageLayout, PageCenter } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Resources } from "@/server/resources"
import Link from 'next/link'


export default async function Page() {

    const resources = await Resources.getResources()
    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-3xl font-bold">Resources</h1>
                <ul className="mt-4 space-y-2">
                    {resources.map((resource, index) => (
                        <Button key={index} className="rounded border p-4">
                            <Link href={`/resources/${resource.slug}`}>
                                <h2 className="text-xl font-semibold">{resource.name}</h2>
                                <p className="text-gray-600">{resource.description}</p>
                            </Link>
                        </Button>
                    ))}
                </ul>
            </PageCenter>
        </PageLayout>
    )
}
