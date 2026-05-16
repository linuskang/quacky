"use client"

import {useEffect, useMemo, useState} from "react"
import type {Dispatch, ReactNode, SetStateAction} from "react"
import {Check, Heart, Mic, SkipForward, Square, Trophy, Volume2, X} from "lucide-react"

import {LingoPrimaryButton} from "./button"
import {LingoInput} from "./input"
import {cn} from "@/lib/utils"

export type QuestionType =
    | "multiple-choice"
    | "fill-blank"
    | "word-bank"
    | "true-false"
    | "multi-select"
    | "reorder"
    | "speaking"
    | "listening"
    | "matching"
    | "translation"
    | "tap-what-you-hear"

export type Question = {
    id: string
    type: QuestionType
    prompt: string
    subtitle?: string
    options?: string[]
    answer: string | string[] | boolean
    speakingPrompt?: string
    audioText?: string
    matchPairs?: { left: string; right: string }[]
    sourceText?: string
    hint?: string
}

export type FeedbackState = "idle" | "correct" | "incorrect" | "skipped"

const CONFETTI_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]



export function QuizConfetti({active}: { active: boolean }) {
    const particles = useMemo(
        () =>
            Array.from({length: 50}, (_, index) => ({
                id: index,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                duration: 1 + Math.random() * 2,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
                size: 4 + Math.random() * 8,
                isCircle: Math.random() > 0.5,
            })),
        []
    )

    if (!active) return null

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute animate-confetti"
                    style={{
                        left: `${particle.x}%`,
                        top: -20,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        borderRadius: particle.isCircle ? "50%" : "0",
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`,
                    }}
                />
            ))}
        </div>
    )
}

export function QuizLessonComplete({
                                       accuracy,
                                       onContinue,
                                       onPracticeAgain,
                                   }: {
    accuracy: number
    onContinue: () => void
    onPracticeAgain: () => void
}) {
    const [showConfetti, setShowConfetti] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background">
            <QuizConfetti active={showConfetti}/>
            <div className="mx-4 w-full max-w-md animate-in slide-in-from-bottom-4 fade-in text-center duration-500">
                <h1 className="mb-2 text-3xl font-black text-foreground">Lesson Complete!</h1>
                <p className="mb-8 text-muted-foreground">You got {accuracy}% correct. Keep it up!</p>

                <div className="space-y-3">
                    <LingoPrimaryButton onClick={onContinue} className="w-full">
                        Continue
                    </LingoPrimaryButton>
                    <LingoPrimaryButton variant="secondary" onClick={onPracticeAgain} className="w-full">
                        Practice Again
                    </LingoPrimaryButton>
                </div>
            </div>
        </div>
    )
}

export function QuizGameOver({
                                 onTryAgain,
                                 onBackHome,
                             }: {
    onTryAgain: () => void
    onBackHome: () => void
}) {
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background">
            <div className="mx-4 w-full max-w-md animate-in slide-in-from-bottom-4 fade-in text-center duration-500">
                <h1 className="mb-2 text-3xl font-black text-foreground">Out of Hearts!</h1>
                <p className="mb-8 text-muted-foreground">You ran out of lives. Don&apos;t worry, practice makes
                    perfect!</p>

                <div className="space-y-3">
                    <LingoPrimaryButton onClick={onTryAgain} className="w-full">
                        Try Again
                    </LingoPrimaryButton>
                    <LingoPrimaryButton variant="secondary" onClick={onBackHome} className="w-full">
                        Back to Home
                    </LingoPrimaryButton>
                </div>
            </div>
        </div>
    )
}

export function QuizHeader({
                               currentIndex,
                               totalQuestions,
                               progressValue,
                               lives,
                               onClose,
                           }: {
    currentIndex: number
    totalQuestions: number
    progressValue: number
    lives: number
    onClose: () => void
}) {
    return (
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-background dark:border-zinc-800">
            <div className="mx-auto w-full max-w-3xl px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        aria-label="Close lesson"
                    >
                        <X className="size-5"/>
                    </button>
                    <div
                        className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                        role="progressbar"
                        aria-valuenow={Math.round(progressValue)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Lesson progress: question ${currentIndex + 1} of ${totalQuestions}`}
                    >
                        <div className="h-full rounded-full bg-primary transition-all duration-300"
                             style={{width: `${progressValue}%`}}/>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-rose-500"
                         aria-label={`${lives} lives remaining`}>
                        <Heart className="size-5 fill-rose-500" aria-hidden="true"/>
                        <span>{lives}</span>
                    </div>
                </div>
            </div>
        </header>
    )
}

export function QuizFooterActions({
                                      isRevealed,
                                      isLastQuestion,
                                      canCheckAnswer,
                                      onSkip,
                                      onCheck,
                                      onContinue,
                                  }: {
    isRevealed: boolean
    isLastQuestion: boolean
    canCheckAnswer: boolean
    onSkip: () => void
    onCheck: () => void
    onContinue: () => void
}) {
    return (
        <footer className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-background dark:border-zinc-800">
            <div className="mx-auto w-full max-w-3xl px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                    <LingoPrimaryButton type="button" variant="secondary" onClick={onSkip} disabled={isRevealed}>
                        <SkipForward className="size-4"/>
                        Skip
                    </LingoPrimaryButton>

                    {!isRevealed ? (
                        <LingoPrimaryButton type="button" onClick={onCheck} disabled={!canCheckAnswer}>
                            <Check className="size-4"/>
                            Check
                        </LingoPrimaryButton>
                    ) : (
                        <LingoPrimaryButton type="button" onClick={onContinue}>
                            {isLastQuestion ? "Finish" : "Continue"}
                        </LingoPrimaryButton>
                    )}
                </div>
            </div>
        </footer>
    )
}

export function QuizPrompt({
                               prompt,
                               subtitle,
                           }: {
    prompt: string
    subtitle?: string
}) {
    return (
        <>
            <h1 className="mb-2 text-xl font-bold">{prompt}</h1>
            {subtitle && <p className="mb-4 text-muted-foreground">{subtitle}</p>}
        </>
    )
}

export function QuizFeedbackPanel({
                                      feedbackState,
                                      correctAnswerText,
                                      userAnswerText,
                                  }: {
    feedbackState: FeedbackState
    correctAnswerText: string
    userAnswerText: string
}) {
    if (feedbackState === "idle") return null

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={cn(
                "mt-6 rounded-xl border-2 px-4 py-4",
                feedbackState === "correct" && "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30",
                feedbackState === "incorrect" && "border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-950/30",
                feedbackState === "skipped" && "border-orange-500 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/30"
            )}
        >
            <p className="mb-2 font-bold">
                {feedbackState === "correct" && "Correct!"}
                {feedbackState === "incorrect" && "Incorrect"}
                {feedbackState === "skipped" && "Skipped"}
            </p>
            {feedbackState === "incorrect" && (
                <div className="space-y-1 text-sm">
                    <p>
                        <span className="text-muted-foreground">Your answer:</span> {userAnswerText}
                    </p>
                    <p>
                        <span className="text-muted-foreground">Correct answer:</span> {correctAnswerText}
                    </p>
                </div>
            )}
            {feedbackState === "skipped" && (
                <p className="text-sm">
                    <span className="text-muted-foreground">Correct answer:</span> {correctAnswerText}
                </p>
            )}
        </div>
    )
}

export function QuizQuestionBody({
                                     currentQuestion,
                                     isRevealed,
                                     feedbackState,
                                     selectedOption,
                                     setSelectedOption,
                                     typedAnswer,
                                     setTypedAnswer,
                                     wordBankAnswer,
                                     setWordBankAnswer,
                                     multiSelected,
                                     setMultiSelected,
                                     reorderAnswer,
                                     setReorderAnswer,
                                     matchedPairs,
                                     setSelectedLeft,
                                     setSelectedRight,
                                     selectedLeft,
                                     selectedRight,
                                     shuffledRightColumn,
                                     shuffledWordBankOptions,
                                     shuffledReorderOptions,
                                     remainingWordBank,
                                     remainingReorder,
                                     spokenText,
                                     speakText,
                                     isPlaying,
                                     recording,
                                     isProcessing,
                                     startRecording,
                                     stopRecording,
                                     wrongMatch,
                                 }: {
    currentQuestion: Question
    isRevealed: boolean
    feedbackState: FeedbackState
    selectedOption: string | null
    setSelectedOption: (value: string | null) => void
    typedAnswer: string
    setTypedAnswer: (value: string) => void
    wordBankAnswer: string[]
    setWordBankAnswer: Dispatch<SetStateAction<string[]>>
    multiSelected: string[]
    setMultiSelected: Dispatch<SetStateAction<string[]>>
    reorderAnswer: string[]
    setReorderAnswer: Dispatch<SetStateAction<string[]>>
    matchedPairs: Set<string>
    setSelectedLeft: (value: string | null) => void
    setSelectedRight: (value: string | null) => void
    selectedLeft: string | null
    selectedRight: string | null
    shuffledRightColumn: string[]
    shuffledWordBankOptions: string[]
    shuffledReorderOptions: string[]
    remainingWordBank: string[]
    remainingReorder: string[]
    spokenText: string
    speakText: (text: string) => void | Promise<void>
    isPlaying: boolean
    recording: boolean
    isProcessing: boolean
    startRecording: () => void | Promise<void>
    stopRecording: () => void
    wrongMatch: boolean
}) {
    const type = currentQuestion.type

    if (type === "multiple-choice" || type === "listening" || type === "tap-what-you-hear") {
        return (
            <div className="space-y-4">
                {(type === "listening" || type === "tap-what-you-hear") && currentQuestion.audioText && (
                    <div className="mb-6 flex justify-center">
                        <button
                            type="button"
                            onClick={() => speakText(currentQuestion.audioText!)}
                            disabled={isPlaying}
                            aria-label={isPlaying ? "Playing audio" : "Play audio"}
                            className={cn(
                                "flex size-20 items-center justify-center rounded-full border-b-4 border-b-[color-mix(in_oklab,var(--primary)_88%,black)] bg-primary text-primary-foreground transition-all",
                                "hover:opacity-90 active:translate-y-[2px] active:border-b-2",
                                isPlaying && "animate-pulse"
                            )}
                        >
                            <Volume2 className="size-8"/>
                        </button>
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                    {currentQuestion.options?.map((option, index) => {
                        const optionSelected = selectedOption === option
                        const optionCorrect = option === currentQuestion.answer
                        const optionWrong = isRevealed && optionSelected && !optionCorrect

                        return (
                            <button
                                key={option}
                                type="button"
                                disabled={isRevealed}
                                onClick={() => setSelectedOption(option)}
                                className={cn(
                                    "rounded-xl border-2 border-b-4 px-4 py-3 text-left font-semibold transition-all",
                                    "hover:bg-zinc-50 dark:hover:bg-zinc-900",
                                    "disabled:cursor-not-allowed",
                                    optionSelected && !isRevealed && "border-primary bg-primary/10",
                                    !optionSelected && !isRevealed && "border-zinc-200 dark:border-zinc-800",
                                    isRevealed && optionCorrect && "border-emerald-500 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
                                    optionWrong && "border-red-500 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {index < 9 && <span
                                        className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{index + 1}</span>}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    if (type === "matching" && currentQuestion.matchPairs) {
        return (
            <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                    {wrongMatch ? <span
                        className="font-semibold text-red-500">Not a match — try again!</span> : "Tap a word on the left, then its match on the right"}
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        {currentQuestion.matchPairs.map((pair) => {
                            const isMatched = matchedPairs.has(pair.left)
                            const isActive = selectedLeft === pair.left

                            return (
                                <button
                                    key={pair.left}
                                    type="button"
                                    disabled={isMatched || isRevealed}
                                    onClick={() => setSelectedLeft(pair.left)}
                                    className={cn(
                                        "w-full rounded-xl border-2 border-b-4 px-4 py-3 text-lg font-semibold transition-all",
                                        "disabled:cursor-not-allowed",
                                        isMatched && "border-emerald-500 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40",
                                        isActive && !isMatched && "border-primary bg-primary/10",
                                        !isMatched && !isActive && "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                    )}
                                >
                                    {pair.left}
                                </button>
                            )
                        })}
                    </div>
                    <div className="space-y-2">
                        {shuffledRightColumn.map((right) => {
                            const pair = currentQuestion.matchPairs!.find((item) => item.right === right)
                            const isMatched = pair && matchedPairs.has(pair.left)
                            const isActive = selectedRight === right

                            return (
                                <button
                                    key={right}
                                    type="button"
                                    disabled={!!isMatched || isRevealed}
                                    onClick={() => setSelectedRight(right)}
                                    className={cn(
                                        "w-full rounded-xl border-2 border-b-4 px-4 py-3 font-semibold transition-all",
                                        "disabled:cursor-not-allowed",
                                        isMatched && "border-emerald-500 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40",
                                        isActive && !isMatched && "border-primary bg-primary/10",
                                        !isMatched && !isActive && "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                    )}
                                >
                                    {right}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    if (type === "translation") {
        return (
            <div className="space-y-4">
                <div
                    className="rounded-xl border-2 border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-2xl font-bold">{currentQuestion.sourceText}</p>
                </div>
                <LingoInput value={typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)}
                            placeholder="Type the translation..." disabled={isRevealed}/>
            </div>
        )
    }

    if (type === "fill-blank") {
        return (
            <div className="space-y-4">
                <LingoInput value={typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)}
                            placeholder="Type your answer..." disabled={isRevealed}/>
            </div>
        )
    }

    if (type === "word-bank") {
        return (
            <div className="space-y-4">
                <div
                    className={cn(
                        "min-h-16 rounded-xl border-2 border-dashed p-4",
                        "border-zinc-200 dark:border-zinc-800",
                        feedbackState === "correct" && "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30",
                        feedbackState === "incorrect" && "border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                    )}
                >
                    {wordBankAnswer.length === 0 ? (
                        <p className="py-2 text-center text-sm text-muted-foreground">Tap words to build your answer</p>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-2">
                            {wordBankAnswer.map((word, index) => (
                                <button
                                    key={`${word}-${index}`}
                                    type="button"
                                    disabled={isRevealed}
                                    onClick={() => setWordBankAnswer((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                                    className="rounded-xl border-2 border-primary bg-primary/10 px-4 py-2 font-semibold"
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {remainingWordBank.map((word, index) => (
                        <button
                            key={`${word}-${index}`}
                            type="button"
                            disabled={isRevealed}
                            onClick={() => setWordBankAnswer((previous) => [...previous, word])}
                            className="rounded-xl border-2 border-b-4 border-zinc-200 px-4 py-2 font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        >
                            {word}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    if (type === "true-false") {
        return (
            <div className="grid grid-cols-2 gap-4">
                {["true", "false"].map((value) => {
                    const isSelected = selectedOption === value
                    const isCorrect = String(currentQuestion.answer) === value

                    return (
                        <button
                            key={value}
                            type="button"
                            disabled={isRevealed}
                            onClick={() => setSelectedOption(value)}
                            className={cn(
                                "rounded-xl border-2 border-b-4 px-6 py-6 text-xl font-bold capitalize transition-all",
                                "hover:bg-zinc-50 dark:hover:bg-zinc-900",
                                isSelected && !isRevealed && "border-primary bg-primary/10",
                                !isSelected && !isRevealed && "border-zinc-200 dark:border-zinc-800",
                                isRevealed && isCorrect && "border-emerald-500 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40",
                                isRevealed && isSelected && !isCorrect && "border-red-500 bg-red-100 dark:border-red-700 dark:bg-red-950/40"
                            )}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl">{value === "true" ? "✓" : "✗"}</span>
                                <span>{value}</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        )
    }

    if (type === "multi-select") {
        return (
            <div className="grid gap-3 sm:grid-cols-2">
                {currentQuestion.options?.map((option) => {
                    const isSelected = multiSelected.includes(option)
                    const isCorrect = Array.isArray(currentQuestion.answer) && currentQuestion.answer.includes(option)

                    return (
                        <button
                            key={option}
                            type="button"
                            disabled={isRevealed}
                            onClick={() =>
                                setMultiSelected((previous) => (previous.includes(option) ? previous.filter((item) => item !== option) : [...previous, option]))
                            }
                            className={cn(
                                "rounded-xl border-2 border-b-4 px-4 py-3 text-left font-semibold transition-all",
                                "hover:bg-zinc-50 dark:hover:bg-zinc-900",
                                isSelected && !isRevealed && "border-primary bg-primary/10",
                                !isSelected && !isRevealed && "border-zinc-200 dark:border-zinc-800",
                                isRevealed && isCorrect && "border-emerald-500 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40",
                                isRevealed && isSelected && !isCorrect && "border-red-500 bg-red-100 dark:border-red-700 dark:bg-red-950/40"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex size-5 items-center justify-center rounded border-2",
                                        isSelected ? "border-primary bg-primary" : "border-zinc-300 dark:border-zinc-700"
                                    )}
                                >
                                    {isSelected && <Check className="size-3 text-primary-foreground"/>}
                                </div>
                                <span>{option}</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        )
    }

    if (type === "speaking") {
        return (
            <div className="space-y-6">
                <div
                    className="rounded-xl border-2 border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="mb-2 text-3xl font-bold">{currentQuestion.speakingPrompt}</p>
                    <button type="button"
                            onClick={() => currentQuestion.speakingPrompt && speakText(currentQuestion.speakingPrompt)}
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                        <Volume2 className="size-4"/>
                        Listen
                    </button>
                </div>

                <div className="flex justify-center">
                    <button
                        type="button"
                        disabled={isRevealed || isProcessing}
                        onClick={recording ? stopRecording : startRecording}
                        aria-label={isProcessing ? "Processing speech" : recording ? "Stop recording" : "Start recording"}
                        className={cn(
                            "flex items-center gap-3 rounded-full border-b-4 px-8 py-4 font-bold transition-all",
                            recording ? "animate-pulse border-b-red-700 bg-red-500 text-white" : "border-b-[color-mix(in_oklab,var(--primary)_88%,black)] bg-primary text-primary-foreground",
                            (isRevealed || isProcessing) && "cursor-not-allowed opacity-60"
                        )}
                    >
                        {isProcessing ? (
                            "Processing..."
                        ) : recording ? (
                            <>
                                <Square className="size-5 fill-current"/>
                                Stop
                            </>
                        ) : (
                            <>
                                <Mic className="size-5"/>
                                Tap to speak
                            </>
                        )}
                    </button>
                </div>

                {spokenText && (
                    <div
                        className="rounded-xl border-2 border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="mb-1 text-sm text-muted-foreground">You said:</p>
                        <p className="text-xl font-bold">{spokenText}</p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "min-h-16 rounded-xl border-2 border-dashed p-4",
                    "border-zinc-200 dark:border-zinc-800",
                    feedbackState === "correct" && "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30",
                    feedbackState === "incorrect" && "border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                )}
            >
                {reorderAnswer.length === 0 ? (
                    <p className="py-2 text-center text-sm text-muted-foreground">Tap words to build the sentence</p>
                ) : (
                    <div className="flex flex-wrap justify-center gap-2">
                        {reorderAnswer.map((word, index) => (
                            <button
                                key={`${word}-${index}`}
                                type="button"
                                disabled={isRevealed}
                                onClick={() => setReorderAnswer((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                                className="rounded-xl border-2 border-primary bg-primary/10 px-4 py-2 font-semibold"
                            >
                                {word}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {remainingReorder.map((word, index) => (
                    <button
                        key={`${word}-${index}`}
                        type="button"
                        disabled={isRevealed}
                        onClick={() => setReorderAnswer((previous) => [...previous, word])}
                        className="rounded-xl border-2 border-b-4 border-zinc-200 px-4 py-2 font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                        {word}
                    </button>
                ))}
            </div>
        </div>
    )
}

export function QuizQuestionShell({
                                      currentIndex,
                                      totalQuestions,
                                      prompt,
                                      subtitle,
                                      body,
                                      feedback,
                                  }: {
    currentIndex: number
    totalQuestions: number
    prompt: string
    subtitle?: string
    body: ReactNode
    feedback: ReactNode
}) {
    return (
        <section className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Question {currentIndex + 1} of {totalQuestions}
                </p>
            </div>

            <h1 className="mb-2 text-xl font-bold">{prompt}</h1>
            {subtitle && <p className="mb-4 text-muted-foreground">{subtitle}</p>}

            <div className="mt-6">{body}</div>
            {feedback}
        </section>
    )
}

export function QuizBackgroundNotice({children}: { children: ReactNode }) {
    return <div className="flex min-h-screen flex-col bg-background">{children}</div>
}
