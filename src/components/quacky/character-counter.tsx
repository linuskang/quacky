"use client";

interface CharCounterProps {
  length: number;
  maxLength?: number;
}

export function CharacterCounter({ length, maxLength = 280 }: CharCounterProps) {
  const remaining = maxLength - length;
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining <= 20 && remaining >= 0;

  const percentage = (length / maxLength) * 100;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  const dash = (percentage / 100) * circumference;

  return (
    <div className="relative w-10 h-10">
      <svg className="w-10 h-10" viewBox="0 0 40 40">
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
          className={`transition-colors ${
            isOverLimit
              ? "text-destructive"
              : isNearLimit
              ? "text-yellow-500"
              : "text-primary"
          }`}
        />

        <text
          x="20"
          y="20"
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-xs font-bold ${
            isOverLimit
              ? "fill-destructive"
              : isNearLimit
              ? "fill-yellow-500"
              : "fill-muted-foreground"
          }`}
        >
          {remaining}
        </text>
      </svg>
    </div>
  );
}