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

import { AlertTriangle, EyeOff } from "lucide-react"

type PurpleEyeWarningProps = {
  text: string
}

export function PurpleEyeWarning({ text }: PurpleEyeWarningProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border-2 border-primary p-3 dark:border-accent">
      <EyeOff size={15} className="shrink-0 text-primary dark:text-accent" />
      <p className="text-sm text-primary dark:text-accent">{text}</p>
    </div>
  )
}

export function PurpleWarning({ text }: PurpleEyeWarningProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border-2 border-primary p-3 dark:border-accent">
      <AlertTriangle
        size={15}
        className="shrink-0 text-primary dark:text-accent"
      />
      <p className="text-sm text-primary dark:text-accent">{text}</p>
    </div>
  )
}
