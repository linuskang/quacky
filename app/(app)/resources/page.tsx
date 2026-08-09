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
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Resources } from "@/server/resources"
import Link from "next/link"
import Image from "next/image"

export default async function Page() {
    const resources = await Resources.getResources()
    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-3xl font-bold">Resources</h1>

                <p>This is where staff members and teachers can place helpful student resources.</p>
                <ul className="mt-4 grid grid-cols-2 gap-4">

                    {resources.map((resource, index) => (
                        <Card key={index} className="p-4 hover:cursor-pointer">
                            <h2 className="text-xl font-semibold">{resource.name}</h2>
                            <p className="text-muted-foreground">
                                {resource.description},
                                {resource.readTime} min read,
                                {resource.author && (
                                    <>
                                        by{" "}
                                        <Image
                                            src={resource.author.image}
                                            alt={resource.author.name}
                                            width={20}
                                            height={20}
                                            className="inline-block rounded-full ml-1 mr-1"
                                        />{" "}
                                        {resource.author.name}
                                    </>
                                )}



                            </p>
                            <Link href={`/resources/${resource.slug}`} target="_blank">
                                <Button className="mt-2">View Resource</Button>
                            </Link>
                        </Card>
                    ))}

                </ul>
            </PageCenter>
        </PageLayout>
    )
}
