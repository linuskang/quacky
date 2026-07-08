import { readFileSync, writeFileSync } from "node:fs";

const sourcePath = ".env";
const targetPath = ".env.example";

const envFile = readFileSync(sourcePath, "utf8");

const template = envFile
    .split(/\r?\n/)
    .map((line) => {
        const trimmed = line.trimStart();

        if (!trimmed || trimmed.startsWith("#")) {
            return line;
        }

        const equalsIndex = line.indexOf("=");

        if (equalsIndex === -1) {
            return line;
        }

        return `${line.slice(0, equalsIndex + 1)}""`;
    })
    .join("\n");

writeFileSync(targetPath, template, "utf8");
