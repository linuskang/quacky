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
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { trpc } from "@/lib/trpc"

// Components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageLayout, PageCenter } from "@/components/page-layout"
import { Title, Description } from "@/components/text"
import Loading from "@/components/loading"
import { QuizLayout } from "@/components/quiz-layout"

// Types
interface Question {
    no: number
    id: number
    question: string
    type: "multiple-choice" | "text"
    options?: {
        id: string
        text: string
    }[]
}

export default function Page() {
    const params = useParams()
    const slug = String(params.slug ?? "")
    const router = useRouter()
    const utils = trpc.useUtils()
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [wrongQuestions, setWrongQuestions] = useState<number[]>([])
    const [feedback, setFeedback] = useState<Record<number, string>>({})

    const {
        data: quizData,
        isLoading: loading,
        isError,
    } = trpc.quiz.bySlug.useQuery(
        { id: slug },
        { enabled: Boolean(slug), refetchOnWindowFocus: false }
    )

    const submitMutation = trpc.quiz.submit.useMutation()
    const submitting = submitMutation.isPending

    const questions: Question[] = quizData?.questions ?? []
    const meta = quizData?.meta ?? {
        name: "",
        description: "",
    }

    useEffect(() => {
        if (isError) {
            toast.error("something blew up. sorry.")
        }
    }, [isError])

    async function submitQuiz() {
        try {
            const stringAnswers = Object.fromEntries(
                Object.entries(answers).map(([key, val]) => [String(key), val])
            )
            const result = await submitMutation.mutateAsync({
                id: slug,
                answers: stringAnswers,
            })

            if (!result.passed) {
                setWrongQuestions(result.wrong)
                setFeedback(result.feedback)
                toast.error(
                    `Incorrect answers for questions: ${result.wrong.join(", ")}`
                )
                return
            }

            await Promise.all([
                utils.me.get.invalidate(),
                utils.quiz.list.invalidate(),
            ])

            toast.success(
                `congrats! you passed the quiz and unlocked the ${slug} module. redirecting...`
            )
            router.push("/quiz")
        } catch {
            toast.error("something blew up. please try later.")
        }
    }

    return (
        <PageLayout>
            <PageCenter className="max-w-none">
                <Title>{meta.name}</Title>
                <Description>{meta.description}</Description>
                {loading && <Loading />}
                {!loading && (
                    <QuizLayout theory={meta.theory}>
                        {submitting && (
                            <div className="flex flex-col items-center gap-3 py-8 text-center">
                                <Loading />
                                <p className="max-w-sm text-sm font-semibold text-muted-foreground">
                                    This will take a second. Please do not
                                    close this page while our automated
                                    grading system checks your answers.
                                </p>
                            </div>
                        )}
                        {!submitting && questions.map((question) => {
                            const isWrong = wrongQuestions.includes(question.no)
                            const questionFeedback = feedback[question.no]
                            return (
                                <div key={question.no}>
                                    <p className="mb-3 font-bold">
                                        {question.no}. {question.question}
                                    </p>
                                    {question.type === "text" ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea
                                                value={answers[question.no] ?? ""}
                                                onChange={(event) => {
                                                    setAnswers((prev) => ({
                                                        ...prev,
                                                        [question.no]:
                                                            event.target.value,
                                                    }))
                                                }}
                                                placeholder="Type your answer..."
                                                rows={4}
                                                className={cn(
                                                    "w-full resize-none rounded-md border-2 bg-background px-4 py-3 text-sm text-primary transition outline-none",
                                                    isWrong
                                                        ? "border-destructive"
                                                        : "border-border focus:border-primary"
                                                )}
                                            />
                                            {isWrong && questionFeedback && (
                                                <Card className="flex flex-row items-start gap-3 !border-0 !bg-background p-3">
                                                    <div className="shrink-0">
                                                        <Image
                                                            src="https://cdn.linus.my/qky/logo.png"
                                                            alt="Quacky AI"
                                                            width={28}
                                                            height={28}
                                                            unoptimized
                                                            className="rounded-full"
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-sm font-semibold text-primary">
                                                                Quacky
                                                            </span>

                                                            <span className="rounded-full bg-card px-2 text-xs font-semibold text-muted-foreground">
                                                                AI
                                                            </span>
                                                        </div>

                                                        <p className="mt-1 text-sm text-primary">
                                                            {questionFeedback}
                                                        </p>
                                                    </div>
                                                </Card>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {question.options?.map((option) => {
                                                const selected =
                                                    answers[question.no] === option.id
                                                return (
                                                    <Button
                                                        key={option.id}
                                                        type="button"
                                                        variant="outline"
                                                        className={cn(
                                                            "h-auto justify-start border-2 px-4 py-3 text-left text-sm",
                                                            selected
                                                                ? "border-primary bg-primary text-primary"
                                                                : "border-border",
                                                            selected &&
                                                            isWrong &&
                                                            "border-destructive bg-destructive/10"
                                                        )}
                                                        onClick={() => {
                                                            setAnswers((prev) => ({
                                                                ...prev,
                                                                [question.no]:
                                                                    option.id,
                                                            }))
                                                            if (isWrong) {
                                                                setWrongQuestions(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (no) =>
                                                                                no !==
                                                                                question.no
                                                                        )
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {option.text}
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {!submitting && (
                            <Button
                                className="h-10 w-full border-2 border-border bg-card text-sm !text-primary hover:!border-primary hover:!bg-card"
                                disabled={
                                    Object.keys(answers).length !==
                                    questions.length
                                }
                                onClick={submitQuiz}
                            >
                                Submit
                            </Button>
                        )}
                    </QuizLayout>
                )}
            </PageCenter>
        </PageLayout>
    )
}
