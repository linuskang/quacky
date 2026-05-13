import { Check } from "lucide-react";

type Step = 1 | 2 | 3;

export function OnboardingStepper({ step }: { step: Step }) {
    const steps = [
        { label: "Accept rules" },
        { label: "Your details" },
        { label: "Confirm email" },
    ];

    // size-7 = 28px. Rail runs between circle centres, inset 14px each side.
    // Fill grows: 0 → centre of circle 2 → centre of circle 3.
    const fillWidth =
        step >= 3 ? "calc(100% - 28px)" : step >= 2 ? "calc(50% - 14px)" : "0px";

    return (
        <div className="relative flex justify-between items-start mb-10 w-full">
            {/* Static rail between first and last circle centre */}
            <div className="absolute left-3.5 right-3.5 h-px bg-border" style={{ top: 14 }} />
            {/* Animated fill */}
            <div
                className="absolute left-3.5 h-px bg-primary transition-[width] duration-500 ease-in-out"
                style={{ top: 14, width: fillWidth }}
            />

            {steps.map((s, i) => {
                const num = (i + 1) as Step;
                const isCompleted = step > num;
                const isActive = step === num;

                return (
                    <div key={s.label} className="relative z-10">
                        <div
                            className={`size-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                ? "bg-primary border-primary text-primary-foreground"
                                : isActive
                                    ? "border-primary bg-background scale-110 shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]"
                                    : "border-border bg-background"
                                }`}
                        >
                            {isCompleted ? (
                                <Check className="size-3.5 animate-in zoom-in-50 duration-200" />
                            ) : isActive ? (
                                <div className="size-2 rounded-full bg-primary animate-in zoom-in-50 duration-200" />
                            ) : null}
                        </div>
                        {/* Edge labels anchor to keep text inside the container */}
                        <span
                            className={`absolute top-full mt-2 text-xs leading-tight transition-all duration-300 whitespace-nowrap ${i === 0
                                ? "left-0"
                                : i === steps.length - 1
                                    ? "right-0"
                                    : "left-1/2 -translate-x-1/2"
                                } ${isActive
                                    ? "text-foreground font-semibold"
                                    : isCompleted
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`}
                        >
                            {s.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
