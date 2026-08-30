import { downtime } from "@/lib/var";

export type Day =
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday";

const days: Day[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

export function getDowntimeDay(): Day {
    return days[new Date().getDay()];
}

export function isDowntime() {
    const now = new Date();

    const dayIndex = now.getDay();
    const currentDay = days[dayIndex];
    const previousDay = days[(dayIndex + 6) % 7];

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check today's schedule
    const today = downtime.schedule[currentDay];

    if (today.enforce) {
        const [startHour, startMinute] = today.start.split(":").map(Number);
        const [endHour, endMinute] = today.end.split(":").map(Number);

        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;

        if (start < end) {
            // Normal schedule, e.g. 09:00 -> 17:00
            if (currentMinutes >= start && currentMinutes < end) {
                return true;
            }
        } else {
            // Crosses midnight, e.g. 23:00 -> 06:00
            if (currentMinutes >= start) {
                console.log("Downtime is currently enforced due to today's schedule.");
                return true;
            }
        }
    }

    // Check the previous day's schedule for an overnight window
    const previous = downtime.schedule[previousDay];

    if (previous.enforce) {
        const [startHour, startMinute] = previous.start.split(":").map(Number);
        const [endHour, endMinute] = previous.end.split(":").map(Number);

        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;

        if (start > end && currentMinutes < end) {
            console.log("Downtime is currently enforced due to previous day's schedule.");
            return true;
        }
    }

    return false;
}