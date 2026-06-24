"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-sm border border-border/60 bg-card transition-all outline-none cursor-pointer",
        "hover:border-[hsl(288,100%,86%)]/50",
        "focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)]/30 focus-visible:border-[hsl(288,100%,86%)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-[hsl(288,100%,86%)] data-[state=checked]:bg-[hsl(288,100%,86%)] data-[state=checked]:text-[hsl(245,67%,7%)]",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3"
      >
        <CheckIcon strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
