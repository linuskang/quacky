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

import { Exo_2, Lexend, Patrick_Hand, Playfair_Display } from "next/font/google"

export const lexend = Lexend({ subsets: ["latin"] })
export const patrickHand = Patrick_Hand({ weight: "400", subsets: ["latin"] })
export const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    style: ["normal", "italic"],
    weight: ["400", "700"],
})

export const exo2 = Exo_2({
    subsets: ["latin"],
    variable: "--font-exo",
})

export const timesNewRoman = {
    className: "font-[family-name:'Times_New_Roman',Times,serif]",
} as const
