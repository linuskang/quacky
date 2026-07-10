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

// This curved line drawer component is heavily based on the line graphing functions from
// Sinerider.com by HackClub, which is open sourced under the
// I've made some tweaks so that I can use it as a React component, and added controls
// to manipulate the curve (make them look more like drawings).
// Original code can be found at https://github.com/hackclub/sinerider.

"use client"

import { useMemo } from "react"

interface CurvedLineProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  stroke?: string
  strokeWidth?: number
  wobble?: number // 0 - 100 wobble, also supports negatives.
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function CurvedLine({
  from,
  to,
  stroke = "currentColor",
  strokeWidth = 3,
  wobble = 0,
}: CurvedLineProps) {
  const d = useMemo(() => {
    const mx = (from.x + to.x) / 2
    const my = (from.y + to.y) / 2

    const seed = from.x * 1000 + from.y * 100 + to.x * 10 + to.y
    const cx = wobble ? mx + (seededRandom(seed) - 0.5) * wobble : mx
    const cy = wobble ? my + (seededRandom(seed + 1) - 0.5) * wobble : my

    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
  }, [from, to, wobble])

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <path
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
