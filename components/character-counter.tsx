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

interface CharCounterProps {
    length: number
    maxLength?: number
    width?: number
    height?: number
}

export function CharCounter({
    length,
    maxLength = 400,
    width = 10,
    height = 10,
}: CharCounterProps) {
    const remaningChars = maxLength - length

    const percentage = (length / maxLength) * 100 // get x/100
    const circumference = 2 * Math.PI * 15 // circumference of the circle
    const dash = (percentage / 100) * circumference // length

    return (
        <div className="relative">
            <svg className={`w-${width} h-${height}`} viewBox="0 0 40 40">
                <circle
                    cx="20"
                    cy="20"
                    r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground/20"
                />

                <circle
                    cx="20"
                    cy="20"
                    r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    className={`transition-colors ${
                        remaningChars < 0
                            ? "text-destructive"
                            : remaningChars <= 20 && remaningChars >= 0
                              ? "text-primary-2"
                              : "text-primary"
                    }`}
                />

                <text
                    x="20"
                    y="20"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-xs font-bold ${
                        remaningChars < 0
                            ? "fill-destructive"
                            : remaningChars <= 20 && remaningChars >= 0
                              ? "fill-primary-2"
                              : "fill-muted-foreground"
                    }`}
                >
                    {remaningChars}
                </text>
            </svg>
        </div>
    )
}
