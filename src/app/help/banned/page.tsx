// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// UI Components
import MarkdownRenderer from "@/components/markdown";

export default function Terms() {
    return <MarkdownRenderer filePath="/docs/banned.md" />;
}
