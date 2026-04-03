import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export default class Mail {
    static async send(
        to: string,
        subject: string,
        html: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            await resend.emails.send(
                {
                    from: env.EMAIL_FROM,
                    to,
                    subject,
                    html,
                }
            );

            return {
                success: true
            }
        } catch (err: any) {
            return {
                success: false,
                error: err.message
            };
        }
    }
}
