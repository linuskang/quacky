//
//   _____  ______ _____  _____  ______ _____       _______ ______ _____  
//  |  __ \|  ____|  __ \|  __ \|  ____/ ____|   /\|__   __|  ____|  __ \ 
//  | |  | | |__  | |__) | |__) | |__ | |       /  \  | |  | |__  | |  | |
//  | |  | |  __| |  ___/|  _  /|  __|| |      / /\ \ | |  |  __| | |  | |
//  | |__| | |____| |    | | \ \| |___| |____ / ____ \| |  | |____| |__| |
//  |_____/|______|_|    |_|  \_\______\_____/_/    \_\_|  |______|_____/                                                        
//
//
//  This endpoint will be removed in a future release. Please use /api/v1/meta instead.
//

// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextResponse } from "next/server";

import prisma from "@/server/db";

export async function GET() {
    const config = await prisma.config.findUnique({ where: { key: "self_register" } });
    const selfRegister = config == null || (config.value as { enabled?: boolean })?.enabled !== false;

    return NextResponse.json({ selfRegister }, { status: 200 });
}