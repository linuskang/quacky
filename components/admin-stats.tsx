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

import axios from "axios"
import { useEffect, useState } from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Label,
    LabelList,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts"
import { AlertTriangle, ClipboardCheck, HeartPulse, Users } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

type Metric = "wellbeing" | "happiness" | "stress" | "sleep" | "energy"

interface Stats {
    summary: {
        totalCheckIns: number
        participatingStudents: number
        assistanceRequests: number
        assistanceRate: number
        averages: Record<Metric, number>
    }
    daily: Array<Record<Metric, number> & { date: string; checkIns: number }>
    distributions: Record<Metric, { score: number; count: number }[]>
}

const metricConfig = {
    wellbeing: { label: "Wellbeing", color: "var(--chart-1)" },
    happiness: { label: "Happiness", color: "var(--chart-2)" },
    stress: { label: "Stress", color: "var(--chart-3)" },
    sleep: { label: "Sleep", color: "var(--chart-4)" },
    energy: { label: "Energy", color: "var(--chart-5)" },
} satisfies ChartConfig

const scoreConfig = {
    score1: { label: "1 star", color: "var(--chart-5)" },
    score2: { label: "2 stars", color: "var(--chart-4)" },
    score3: { label: "3 stars", color: "var(--chart-3)" },
    score4: { label: "4 stars", color: "var(--chart-2)" },
    score5: { label: "5 stars", color: "var(--chart-1)" },
} satisfies ChartConfig

const scoreColors = [
    "var(--color-score1)",
    "var(--color-score2)",
    "var(--color-score3)",
    "var(--color-score4)",
    "var(--color-score5)",
]

function formatDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    })
}

export function AdminStats() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        let active = true

        axios
            .get<Stats>("/api/stats")
            .then(({ data }) => {
                if (active) setStats(data)
            })
            .catch(() => {
                if (active) setFailed(true)
            })

        return () => {
            active = false
        }
    }, [])

    if (failed) {
        return (
            <Card>
                <CardContent className="text-muted-foreground">
                    Wellbeing statistics could not be loaded.
                </CardContent>
            </Card>
        )
    }

    if (!stats) {
        return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                    <Card key={index} className="h-28 animate-pulse bg-muted" />
                ))}
            </div>
        )
    }

    const recentDaily = stats.daily.slice(-30)
    const averageData = Object.entries(stats.summary.averages).map(
        ([metric, average]) => ({ metric, average })
    )
    const wellbeingDistribution = stats.distributions.wellbeing.map((item) => ({
        ...item,
        name: `score${item.score}`,
    }))
    const overview = [
        {
            label: "Check-ins",
            value: stats.summary.totalCheckIns.toLocaleString(),
            detail: "All anonymous responses",
            icon: ClipboardCheck,
        },
        {
            label: "Participation",
            value: stats.summary.participatingStudents.toLocaleString(),
            detail: "Unique students",
            icon: Users,
        },
        {
            label: "Avg. wellbeing",
            value: `${stats.summary.averages.wellbeing.toFixed(1)} / 5`,
            detail: "Across all check-ins",
            icon: HeartPulse,
        },
        {
            label: "Asked for support",
            value: stats.summary.assistanceRequests.toLocaleString(),
            detail: `${stats.summary.assistanceRate.toFixed(1)}% of check-ins`,
            icon: AlertTriangle,
        },
    ]

    return (
        <section className="space-y-3" aria-labelledby="wellbeing-heading">
            <div>
                <h2
                    id="wellbeing-heading"
                    className="font-heading text-lg font-semibold"
                >
                    Student wellbeing
                </h2>
                <p className="text-xs text-muted-foreground">
                    Anonymous, aggregate check-in results. Trends show the most
                    recent 30 active days.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {overview.map((item) => (
                    <Card key={item.label}>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardDescription>{item.label}</CardDescription>
                            <item.icon className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="font-heading text-2xl font-semibold">
                                {item.value}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.detail}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {stats.summary.totalCheckIns === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Charts will appear after students complete their first
                        check-in.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Wellbeing trends</CardTitle>
                            <CardDescription>
                                Daily average score out of five
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={metricConfig}
                                className="aspect-auto h-72 w-full"
                            >
                                <AreaChart
                                    data={recentDaily}
                                    accessibilityLayer
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={24}
                                    />
                                    <YAxis
                                        domain={[1, 5]}
                                        ticks={[1, 2, 3, 4, 5]}
                                        tickLine={false}
                                        axisLine={false}
                                        width={20}
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value) =>
                                                    formatDate(String(value))
                                                }
                                            />
                                        }
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    {(
                                        Object.keys(metricConfig) as Metric[]
                                    ).map((metric) => (
                                        <Area
                                            key={metric}
                                            dataKey={metric}
                                            type="monotone"
                                            fill={`var(--color-${metric})`}
                                            fillOpacity={0.08}
                                            stroke={`var(--color-${metric})`}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Average by measure</CardTitle>
                            <CardDescription>
                                Overall average score out of five
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={metricConfig}
                                className="aspect-auto h-64 w-full"
                            >
                                <BarChart
                                    data={averageData}
                                    layout="vertical"
                                    accessibilityLayer
                                    margin={{ left: 8 }}
                                >
                                    <CartesianGrid horizontal={false} />
                                    <XAxis
                                        type="number"
                                        domain={[0, 5.5]}
                                        hide
                                    />
                                    <YAxis
                                        dataKey="metric"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        width={72}
                                        tickFormatter={(value) =>
                                            metricConfig[value as Metric]
                                                .label as string
                                        }
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent hideLabel />
                                        }
                                    />
                                    <Bar dataKey="average" radius={4}>
                                        {averageData.map((item) => (
                                            <Cell
                                                key={item.metric}
                                                fill={`var(--color-${item.metric})`}
                                            />
                                        ))}
                                        <LabelList
                                            dataKey="average"
                                            position="right"
                                            className="fill-foreground"
                                            fontSize={12}
                                        />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Overall wellbeing</CardTitle>
                            <CardDescription>
                                Distribution of wellbeing scores
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={scoreConfig}
                                className="mx-auto aspect-auto h-64 w-full"
                            >
                                <PieChart accessibilityLayer>
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                nameKey="name"
                                                hideLabel
                                            />
                                        }
                                    />
                                    <Pie
                                        data={wellbeingDistribution}
                                        dataKey="count"
                                        nameKey="name"
                                        innerRadius={58}
                                        outerRadius={88}
                                        strokeWidth={2}
                                    >
                                        {wellbeingDistribution.map(
                                            (item, index) => (
                                                <Cell
                                                    key={item.score}
                                                    fill={scoreColors[index]}
                                                />
                                            )
                                        )}
                                        <Label
                                            content={({ viewBox }) => {
                                                if (
                                                    viewBox &&
                                                    "cx" in viewBox &&
                                                    "cy" in viewBox
                                                ) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                className="fill-foreground text-2xl font-semibold"
                                                            >
                                                                {
                                                                    stats
                                                                        .summary
                                                                        .totalCheckIns
                                                                }
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={
                                                                    (viewBox.cy ??
                                                                        0) + 20
                                                                }
                                                                className="fill-muted-foreground text-xs"
                                                            >
                                                                responses
                                                            </tspan>
                                                        </text>
                                                    )
                                                }
                                            }}
                                        />
                                    </Pie>
                                    <ChartLegend
                                        content={
                                            <ChartLegendContent nameKey="name" />
                                        }
                                    />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </section>
    )
}
