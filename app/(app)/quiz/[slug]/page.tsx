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

"use client";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PageLayout, PageCenter } from "@/components/page-layout";
import { Title, Description } from "@/components/text";
import { cn } from "@/lib/utils";
import Loading from "@/components/loading";

interface Question {
    no: number;
    question: string;
    options: {
        id: string;
        text: string;
    }[];
}

export default function Page() {
    const params = useParams();
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [wrongQuestions, setWrongQuestions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<{ name: string; description: string } | null>(null);

    useEffect(() => {
        async function fetchQuestions() {
            setLoading(true);
            try {
                const response = await axios.get(`/api/quiz/${params.slug}`);
                setQuestions(response.data.questions);
                setMeta(response.data.meta);
            } catch {
                toast.error("something blew up. sorry.");
            } finally {
                setLoading(false);
            }
        }

        fetchQuestions();
    }, [params.slug]);

    async function submitQuiz() {
        try {
            await axios.post(`/api/quiz/${params.slug}`, answers);
            toast.success(`congrats! you passed the quiz and unlocked the ${params.slug} module. redirecting...`);
            router.push("/quiz");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                const wrong = error.response.data.wrong as number[] | undefined;
                if (wrong && wrong.length > 0) {
                    setWrongQuestions(wrong);
                    toast.error(
                        `Wrong answer${wrong.length > 1 ? "s" : ""} for question${wrong.length > 1 ? "s" : ""}: ${wrong.join(", ")}`
                    );
                    return;
                }
            }
            toast.error("something blew up. please try later.");
        }
    }

    return (
        <PageLayout>
            <PageCenter>
                <Title>{meta?.name}</Title>
                <Description>{meta?.description}</Description>
                {loading && <Loading />}
                {questions.map((question) => {
                    const isWrong = wrongQuestions.includes(question.no);
                    return (
                        <div
                            key={question.no}
                        >
                            <p className="mb-3 font-bold">{question.no}. {question.question}</p>
                            <div className="flex flex-col gap-2">
                                {question.options.map((option) => {
                                    const selected = answers[question.no] === option.id;
                                    return (
                                        <Button
                                            key={option.id}
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left h-auto py-3 border-2 text-sm px-4",
                                                selected
                                                    ? "border-primary bg-primary text-primary"
                                                    : "border-border",
                                                selected && isWrong && "border-destructive bg-destructive/10"
                                            )}
                                            onClick={() => {
                                                setAnswers((prev) => ({
                                                    ...prev,
                                                    [question.no]: option.id,
                                                }));
                                                if (isWrong) {
                                                    setWrongQuestions((prev) =>
                                                        prev.filter((no) => no !== question.no)
                                                    );
                                                }
                                            }}
                                        >
                                            {option.text}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {!loading && (
                    <Button
                        className="w-full h-10 border-2 border-border text-sm bg-card !text-primary hover:!bg-card hover:!border-primary"
                        disabled={Object.keys(answers).length !== questions.length}
                        onClick={submitQuiz}
                    >
                        Submit
                    </Button>
                )}
            </PageCenter>
        </PageLayout>
    );
}
