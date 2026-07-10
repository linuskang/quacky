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

import Image from "next/image"

const pictures = [
    "/bottom-bar/Picture1.png",
    "/bottom-bar/Picture2.png",
    "/bottom-bar/Picture3.png",
    "/bottom-bar/Picture4.png",
    "/bottom-bar/Picture5.png",
    "/bottom-bar/Picture6.png",
    "/bottom-bar/Picture7.png",
    "/bottom-bar/Picture8.png"
]

const repeatedPictures = Array.from({ length: 12 }, () => pictures).flat()

export function BottomBar() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed right-0 bottom-0 left-0 z-10 flex h-12 overflow-hidden opacity-35 brightness-90 saturate-75"
        >
            <div className="flex min-w-max items-end">
                {repeatedPictures.map((picture, index) => (
                    <Image
                        key={`${picture}-${index}`}
                        src={picture}
                        alt=""
                        width={64}
                        height={48}
                        className="h-10 w-16 shrink-0 object-contain"
                    />
                ))}
            </div>
        </div>
    )
}
