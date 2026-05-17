"use client";

// Libs
import {useState, useEffect} from "react";
import {authClient} from "@/client/auth";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";

// Components
import Sidebar from "@/components/quacky/sidebar";
import Discover from "@/components/quacky/v2/rightbar";
import Loading from "@/components/loading";

// Types
type Question = {
    id: string;
    question: string;
    answers: string[];
};

export default function CheckIn() {
    const {data: session, isPending} = authClient.useSession();
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        fetch('/api/v1/check-in')
            .then(res => res.json())
            .then(d => setQuestions(d.questions ?? []));
    }, []);

    if (isPending) return <Loading />;

    if (!session) {
        router.push("/login");
        return null;
    }

    return (
        <main className="relative min-h-screen w-full flex flex-col items-center bg-background">
            <div className="relative z-10 flex w-full max-w-[1100px] flex-1 gap-3 px-4">
                <Sidebar session={session}/>

                <div className="flex-1 flex flex-col gap-2 pt-8 pb-24 lg:pb-8 w-full min-w-0 lg:max-w-2xl">
                    <CheckInQuiz questions={questions}/>
                </div>

                <Discover session={session}/>
            </div>
        </main>
    );
}

function CheckInQuiz({ questions }: { questions: Question[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const total = questions.length;
    const currentQuestion = questions[currentIndex];
    const selected = answers[currentIndex] ?? null;
    const isLast = currentIndex === total - 1;
    const progressPct = total > 0 ? (currentIndex / total) * 100 : 0;

    if (!currentQuestion) return null;

    function selectOption(option: string) {
        setAnswers((prev) => ({...prev, [currentIndex]: option}));
    }

    function advance() {
        if (!selected) return;
        if (isLast) {
            const payload = questions.map((q, i) => ({
                question: q.question,
                answer: answers[i] ?? "",
            }));
            fetch('/api/v1/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: payload }),
            });
            setSubmitted(true);
        } else {
            setCurrentIndex((i) => i + 1);
        }
    }

    if (submitted) {
        return (
            <div className="rounded-xl border border-border bg-card overflow-hidden mt-2">
                <div className="h-1 w-full bg-primary"/>
                <div className="p-6 flex flex-col gap-1">
                    <p className="text-xl font-bold text-primary">Thanks for checking in!</p>
                    <p className="text-sm text-muted-foreground">Come back tomorrow.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden mt-2">
            {/* Progress bar — flush to top of card */}
            <div className="h-1 w-full bg-border">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{width: `${progressPct}%`}}
                />
            </div>

            <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground leading-snug">
                        {currentQuestion.question}
                    </h2>
                </div>

                <div className="flex flex-col gap-2">
                    {currentQuestion.answers.map((answer) => (
                        <button
                            key={answer}
                            onClick={() => selectOption(answer)}
                            className={cn(
                                "rounded-lg border px-4 py-3 text-left cursor-pointer text-sm font-medium transition-colors",
                                selected === answer
                                    ? "border-primary border-2 bg-background text-primary"
                                    : "border-border bg-background text-foreground hover:bg-muted"
                            )}
                        >
                            {answer}
                        </button>
                    ))}
                </div>

                <button
                    onClick={advance}
                    disabled={!selected}
                    className="mt-1 w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-30"
                >
                    {isLast ? "Submit" : "Next"}
                </button>
            </div>
        </div>
    );
}
