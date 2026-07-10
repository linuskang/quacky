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

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const header = `//   ______                                 __
//  /      \\                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \\  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \\$$ |$$ \\__$$ |/$$$$$$$ |$$ \\_____ $$$$$$  \\ $$ \\__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \\__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.`;

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const targetExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const skippedDirectories = new Set([
    ".git",
    ".next",
    ".vercel",
    "build",
    "coverage",
    "dist",
    "generated",
    "node_modules",
]);
const skippedFiles = new Set(["next-env.d.ts"]);

const files = [];

function collectFiles(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!skippedDirectories.has(entry.name)) {
                collectFiles(join(directory, entry.name));
            }
            continue;
        }

        if (!entry.isFile()) {
            continue;
        }

        const filePath = join(directory, entry.name);
        const relativePath = relative(root, filePath);

        if (skippedFiles.has(entry.name) || !targetExtensions.has(extname(entry.name))) {
            continue;
        }

        files.push(relativePath);
    }
}

function getInsertIndex(lines) {
    if (lines[0]?.startsWith("#!")) {
        return 1;
    }

    return 0;
}

function hasHeader(lines, insertIndex) {
    return lines.slice(insertIndex).join("\n").startsWith(header);
}

function addHeader(filePath) {
    const absolutePath = resolve(root, filePath);
    const content = readFileSync(absolutePath, "utf8");

    const newline = content.includes("\r\n") ? "\r\n" : "\n";
    const lines = content.split(/\r?\n/);
    const insertIndex = getInsertIndex(lines);

    if (hasHeader(lines, insertIndex)) {
        return false;
    }

    lines.splice(insertIndex, 0, header.replaceAll("\n", newline), "");

    if (!checkOnly) {
        writeFileSync(absolutePath, lines.join(newline), "utf8");
    }

    return true;
}

collectFiles(root);

const changedFiles = files.filter(addHeader);

if (checkOnly && changedFiles.length > 0) {
    console.error(`Missing license header in ${changedFiles.length} file(s):`);
    for (const file of changedFiles) {
        console.error(`- ${file}`);
    }
    process.exit(1);
}

if (changedFiles.length === 0) {
    console.log("All files already have the license header.");
} else if (checkOnly) {
    console.log("All files already have the license header.");
} else {
    console.log(`Added license header to ${changedFiles.length} file(s).`);
}
