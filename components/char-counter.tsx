"use client";

interface CharCounterProps {
    length: number;
    maxLength?: number;
    width?: number;
    height?: number;
}

export function CharCounter(
    {
        length,
        maxLength = 400,
        width = 10,
        height = 10,
    }: CharCounterProps) {
    // get remaining characters
    const remaining = maxLength - length;
    const isOverLimit = remaining < 0;
    const isNearLimit = remaining <= 20 && remaining >= 0;

    // crazy math
    const percentage = (length / maxLength) * 100; // divide the length by max times 100 to get x/100
    const radius = 15; // radius of the circle, u can aadjust the size here
    const circumference = 2 * Math.PI * radius; // circumference of the circle

    const dash = (percentage / 100) * circumference; // percentage/100 times by circumference to get length

    return (
        <div className="relative">
            <svg className={`w-${width} h-${height}`} viewBox="0 0 40 40">
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground/20"
                />

                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    className={`transition-colors ${isOverLimit
                        ? "text-destructive"
                        : isNearLimit
                            ? "text-primary-2"
                            : "text-primary"
                        }`}
                />

                <text
                    x="20"
                    y="20"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-xs font-bold ${isOverLimit
                        ? "fill-destructive"
                        : isNearLimit
                            ? "fill-primary-2"
                            : "fill-muted-foreground"
                        }`}
                >
                    {remaining}
                </text>
            </svg>
        </div>
    );
}