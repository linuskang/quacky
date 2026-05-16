import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export default async function Send(
    to: string,
    subject: string,
    html: string
) {
    await resend.emails.send(
        {
            from: env.EMAIL_FROM,
            to,
            subject,
            html,
        }
    );

}