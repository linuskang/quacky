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

"use client"

// Libraries
import axios from "axios"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"

// Components
import { Title, Description } from "@/components/text"
import { PageLayout, PageCenter } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Star, Clock } from "lucide-react"
import Loading from "@/components/loading"

// Types
interface Quiz {
    name: string
    description: string
    to: string
    time: string
    xp: number
}

export default function Page() {
    const [quiz, setQuiz] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get("/api/quizes")
            .then((res) => setQuiz(res.data.quizes))
            .catch(() => toast.error("something exploded. sorry please try again later"))
            .finally(() => setLoading(false))
    }, [])

    return (
        <PageLayout>
            <PageCenter>
                <Title>Quizes</Title>
                <Description>
                    Complete various quizes to unlock new account features like
                    posting and commenting! Doing questions earns you cash for
                    the shop.
                </Description>

                {loading ? (
                    <Loading />
                ) : (
                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {quiz.map((quiz, index) => (
                            <Card
                                key={index}
                                className="flex h-full flex-col gap-2 bg-card-primary"
                            >
                                <CardHeader>
                                    <CardTitle>{quiz.name}</CardTitle>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        {quiz.description}
                                    </p>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        size="sm"
                                        className="h-7 rounded-md border-2 border-border bg-card font-semibold text-primary hover:!border-primary hover:!bg-card"
                                        asChild
                                    >
                                        <Link href={quiz.to}>Attempt Quiz</Link>
                                    </Button>
                                    <div className="ml-1 flex items-center">
                                        <div className="flex items-center gap-1">
                                            <Clock
                                                className="size-4 text-muted-foreground"
                                                strokeWidth={3}
                                            />
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {quiz.time}
                                            </span>
                                        </div>
                                        <div className="ml-1 flex items-center gap-1">
                                            <Star
                                                className="size-4 text-muted-foreground"
                                                strokeWidth={3}
                                            />
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {quiz.xp} xp
                                            </span>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </PageCenter>
        </PageLayout>
    )
}
