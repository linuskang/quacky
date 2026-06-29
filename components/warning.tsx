import { EyeOff } from "lucide-react"

type PurpleEyeWarningProps = {
    text: string;
}

export function PurpleEyeWarning({ text }: PurpleEyeWarningProps) {
    return (
        <div className="flex items-center gap-2 rounded-md border-2 dark:border-accent border-primary p-3">
            <EyeOff size={15} className="shrink-0 dark:text-accent text-primary" />
            <p className="text-sm dark:text-accent text-primary">
                {text}
            </p>
        </div>
    )
}