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
import Image from "next/image"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { authClient } from "@/client/auth"

// Components
import Loading from "@/components/loading"
import { Title, Description } from "@/components/text"
import { PageLayout, PageCenter } from "@/components/page-layout"
import { PurpleWarning } from "@/components/warning-cards"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel } from "@/components/ui/field"
import { Card } from "@/components/ui/card"

// Types
interface CheckInFormData {
    wellbeing: number
    happiness: number
    stress: number
    sleep: number
    energy: number
    assistance: boolean
}

function Star({
    value,
    onChange,
}: {
    value: number
    onChange: (value: number) => void
}) {
    const [hover, setHover] = useState<number | null>(null)
    const display = hover ?? value

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => {
                    const starValue = i + 1
                    const filled = starValue <= display

                    return (
                        <button
                            key={starValue}
                            type="button"
                            onClick={() => onChange(starValue)}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(null)}
                            className="relative h-8 w-8 cursor-pointer rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={`Rate ${starValue} out of 5`}
                        >
                            <Image
                                src={filled ? "/star.svg" : "/star-empty.svg"}
                                alt=""
                                fill
                                className="object-contain"
                                sizes="32px"
                            />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

const questions = [
    {
        id: 1,
        name: "wellbeing" as const,
        label: "How do you feel overall today?",
    },
    {
        id: 2,
        name: "happiness" as const,
        label: "How happy do you feel right now?",
    },
    {
        id: 3,
        name: "stress" as const,
        label: "How stressed do you feel right now?",
    },
    {
        id: 4,
        name: "sleep" as const,
        label: "How well did you sleep last night?",
    },
    {
        id: 5,
        name: "energy" as const,
        label: "How much energy do you have right now?",
    },
]

export default function Page() {
    const { data: session, isPending } = authClient.useSession()
    const [hasCheckedIn, setHasCheckedIn] = useState(false)

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<CheckInFormData>({
        defaultValues: {
            wellbeing: 3,
            happiness: 3,
            stress: 3,
            sleep: 3,
            energy: 3,
            assistance: false,
        },
    })

    useEffect(() => {
        axios.get("/api/me").then((res) => {
            const data = res.data
            if (data.hasCheckedIn) {
                setHasCheckedIn(true)
            }
        })
    }, [session])

    const onSubmit = async (data: CheckInFormData) => {
        try {
            await axios.post("/api/check-in", data)
            toast.success(
                "Thanks for checking in today! Come back tomorrow to submit another review."
            )
            setHasCheckedIn(true)
            window.dispatchEvent(new Event("quacky:check-in"))
            reset()
        } catch {
            toast.error("Something went wrong. sorry!")
        }
    }

    if (isPending) {
        return <Loading />
    }

    return (
        <PageLayout>
            <PageCenter>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <Title>Check In</Title>
                        <Description className="mt-1">
                            Welcome! Please try and complete this check in
                            everyday to help school staff gather anonymous
                            student wellbeing data.
                        </Description>
                    </div>
                    <Image
                        src="/goose/First Aid Nurse.png"
                        alt="A nurse goose"
                        width={112}
                        height={112}
                        className="h-24 w-24 shrink-0 object-contain"
                    />
                </div>

                {hasCheckedIn ? (
                    <div className="rounded-xl border-2 border-primary-2 bg-primary-2/10 p-5 text-center">
                        <Image
                            src="/goose/Hearts.png"
                            alt="A goose with hearts"
                            width={128}
                            height={128}
                            className="mx-auto mb-3 h-28 w-28 object-contain"
                        />
                        <PurpleWarning text="Thanks for checking in today! Come back tomorrow to submit another review." />
                    </div>
                ) : (
                    <Card className="bg-card-primary p-6">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col gap-10"
                        >
                            {questions.map((field) => (
                                <Field key={field.name}>
                                    <FieldLabel className="text-base">
                                        {field.id}. {field.label}
                                    </FieldLabel>
                                    <Controller
                                        name={field.name}
                                        control={control}
                                        rules={{
                                            required: "Please select a value",
                                            min: {
                                                value: 1,
                                                message:
                                                    "Value must be at least 1",
                                            },
                                            max: {
                                                value: 5,
                                                message:
                                                    "Value must be at most 5",
                                            },
                                        }}
                                        render={({
                                            field: { value, onChange },
                                        }) => (
                                            <Star
                                                value={value}
                                                onChange={onChange}
                                            />
                                        )}
                                    />
                                </Field>
                            ))}

                            <Field orientation="horizontal">
                                <Controller
                                    name="assistance"
                                    control={control}
                                    render={({
                                        field: { value, onChange },
                                    }) => (
                                        <Switch
                                            checked={value}
                                            onCheckedChange={onChange}
                                            id="assistance"
                                        />
                                    )}
                                />

                                <FieldLabel
                                    htmlFor="assistance"
                                    className="cursor-pointer"
                                >
                                    I would like to talk to a school staff
                                    member
                                </FieldLabel>
                            </Field>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-10 w-full rounded-full border-2 border-border bg-background text-sm font-semibold text-primary hover:!border-primary hover:!bg-background"
                            >
                                {isSubmitting
                                    ? "Submitting..."
                                    : "Submit Check-in"}
                            </Button>
                        </form>
                    </Card>
                )}
            </PageCenter>
        </PageLayout>
    )
}
