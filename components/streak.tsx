"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";

const WEEK_DAYS = [
  { label: "S", key: "Sun" },
  { label: "M", key: "Mon" },
  { label: "T", key: "Tue" },
  { label: "W", key: "Wed" },
  { label: "T", key: "Thu" },
  { label: "F", key: "Fri" },
  { label: "S", key: "Sat" },
];

// Demo streak data for the weekly row (Sun–Sat)
const todayIndex = new Date().getDay(); // 0=Sun … 6=Sat
const streakDays = [false, true, true, true, true, false, false];

export function StreakWidget() {
  return (
    <div className="flex items-center w-full">
      <Card className="w-full overflow-hidden border-2 border-border p-0">
        <CardHeader className="px-3 py-3 !bg-card-header rounded-tl-md rounded-tr-md">
          <div className="flex items-center gap-3">
            <Image
              src="/comet.svg"
              alt="Streak"
              width={50}
              height={50}
              className="shrink-0"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-bold">2 DAY STREAK</h1>
              <p className="text-xs">
                New day in{" "}
                <span className="text-accent font-semibold">12:00:00</span>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-3 py-3 -mt-4 flex flex-col gap-3">
          {/* Weekly star row */}
          <div className="flex items-center justify-between px-1">
            {WEEK_DAYS.map((day, i) => {
              const isToday = i === todayIndex;
              const isFilled = streakDays[i];
              return (
                <div key={day.key} className="flex flex-col items-center gap-1">
                  <Image
                    src={isFilled ? "/star.svg" : "/star-empty.svg"}
                    alt={isFilled ? "Completed" : "Not completed"}
                    width={32}
                    height={32}
                    className="shrink-0"
                  />
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isToday
                        ? "text-yellow-500 dark:text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Daily progress */}
          <p className="text-sm text-muted-foreground">✓ 5 / 5 minutes today</p>
        </CardContent>
      </Card>
    </div>
  );
}
