//    ____                   _          
//   / __ \                 | |         
//  | |  | |_   _  __ _  ___| | ___   _ 
//  | |  | | | | |/ _` |/ __| |/ / | | |
//  | |__| | |_| | (_| | (__|   <| |_| |
//   \___\_\\__,_|\__,_|\___|_|\_\\__, |
//                                 __/ |
//                                |___/ 

import prisma from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import Config from "@/server/config";
import Send from "@/server/utilities/email";

// types
type SelfRegisterConfig = {
    enabled: boolean;
};

type MetaConfig = {
    org_name: string;
};

const welcomeEmail = (name: string, handle: string, org?: string) =>
`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display:ital@0;1&display=swap');</style></head>
<body style="margin:0;padding:0;background:#1a1a18;font-family:'DM Sans',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#222220;border-radius:10px;overflow:hidden;border:1px solid #3a3830;">
        <tr>
          <td style="padding:40px 32px 28px;text-align:center;background:#1a1a1a;">
            <h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:600;margin:0;color:#f0e8dc;">Welcome to the flock</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;">
            <p style="font-size:15px;line-height:1.7;color:#c8bfb0;margin:0 0 24px;">
              You're in, @${handle}. Time to start socialising in ${org}!
            </p>
            
            <p style="font-size:14px;line-height:1.6;color:#a09080;margin:0px 0 0;">
              Edit your profile, follow people, and start posting.
            </p>
            
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:20px 0;">
                <a href="https://quacky.space/${handle}" style="display:inline-block;background:hsl(22, 100%, 15%);color:hsl(22, 60%, 92%);text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:.02em;">Enter Quacky →</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #3a3830;padding:15px 32px;text-align:center;">
              <a href="https://quacky.space/community-guidelines" style="font-size:12px;color:#6a6258;text-decoration:none;margin:0 16px;">Community Guidelines</a>
              <a href="https://quacky.space/terms" style="font-size:12px;color:#6a6258;text-decoration:none;margin:0 16px;">Terms of Service</a>
              <a href="https://quacky.space/privacy" style="font-size:12px;color:#6a6258;text-decoration:none;margin:0 16px;">Privacy policy</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`

export async function POST(request: NextRequest) {
    const { name, handle, email } = await request.json();

    if (!name || !handle || !email) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const selfRegister = await Config.get("self_register") as SelfRegisterConfig | null;
    if (!selfRegister?.enabled) {
        return NextResponse.json(
            { error: "Registration has been disabled by an admin. Please contact your school administrator for an invite code!" },
            { status: 403 }
        );
    }

    try {

        // Create the user
        await prisma.user.create(
            {
                data: {
                    name,
                    handle,
                    email,
                }
            }
        )

        const meta = await Config.get("meta") as MetaConfig | null;
        const org = meta?.org_name;

        await Send(
            email,
            "Welcome to Quacky!",
            welcomeEmail(name, handle, org)
        );

        return NextResponse.json(
            { success: true },
            { status: 201 }
        );

    } catch (err: any) {
        return NextResponse.json({ err }, { status: 500 });
    }
}