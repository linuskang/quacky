import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export default async function Send(
    to: string, 
    subject: string, 
    text: string
) {

    // Email helper
    // Basically made this so that I don't need to have so many resend instances in code.
    // Just parses emails to this helper which sends it.

    await resend.emails.send(
        {
            from: env.EMAIL_FROM,
            to,
            subject,
            text,
        }
    );

}