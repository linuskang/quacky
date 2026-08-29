import { readFileSync, writeFileSync } from "node:fs";

const deploymentOnlyKeys = new Set(["PORT", "POSTGRES_PORT"]);
const localOnlyKeys = new Set([
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
]);

function findDrift() {
    const envExample = readFileSync(".env.example", "utf8");
    const productionCompose = readFileSync(
        "production.docker-compose.yml",
        "utf8",
    );

    const envKeys = new Set(
        envExample
            .split(/\r?\n/)
            .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/)?.[1])
            .filter(Boolean),
    );

    const composeKeys = new Set(
        [
            ...productionCompose.matchAll(
                /\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-[^}]*)?\}/g,
            ),
        ].map(([, key]) => key),
    );

    const missingFromCompose = [...envKeys].filter(
        (key) => !composeKeys.has(key) && !localOnlyKeys.has(key),
    );
    const missingFromEnvExample = [...composeKeys].filter(
        (key) => !envKeys.has(key) && !deploymentOnlyKeys.has(key),
    );

    return { missingFromCompose, missingFromEnvExample };
}

function addToEnvExample(keys) {
    const content = readFileSync(".env.example", "utf8");
    const eol = content.includes("\r\n") ? "\r\n" : "\n";
    let updated = content;
    if (updated && !updated.endsWith(eol)) updated += eol;
    updated += keys.map((key) => `${key}=""`).join(eol) + eol;
    writeFileSync(".env.example", updated);
}

function addToCompose(keys) {
    const content = readFileSync("production.docker-compose.yml", "utf8");
    const eol = content.includes("\r\n") ? "\r\n" : "\n";
    const lines = content.split(eol);

    const appIdx = lines.findIndex((line) => /^  app:\s*$/.test(line));
    if (appIdx === -1) {
        console.error(
            "Could not find the `app` service in production.docker-compose.yml.",
        );
        process.exit(1);
    }

    let sectionEnd = lines.length;
    for (let i = appIdx + 1; i < lines.length; i++) {
        if (/^  \S/.test(lines[i])) {
            sectionEnd = i;
            break;
        }
    }

    let insertIdx = appIdx + 1;
    for (let i = appIdx + 1; i < sectionEnd; i++) {
        if (/^      [A-Za-z_][A-Za-z0-9_]*:/.test(lines[i])) {
            insertIdx = i + 1;
        }
    }

    const additions = keys.map((key) => `      ${key}: \${${key}}`);
    lines.splice(insertIdx, 0, ...additions);
    writeFileSync("production.docker-compose.yml", lines.join(eol));
}

const fix = process.argv.includes("--fix");
const { missingFromCompose, missingFromEnvExample } = findDrift();

if (!missingFromCompose.length && !missingFromEnvExample.length) {
    console.log("Deployment environment configuration is synchronized.");
    process.exit(0);
}

if (!fix) {
    if (missingFromCompose.length) {
        console.error(
            `Missing from production.docker-compose.yml: ${missingFromCompose.join(", ")}`,
        );
    }

    if (missingFromEnvExample.length) {
        console.error(
            `Missing from .env.example: ${missingFromEnvExample.join(", ")}`,
        );
    }

    console.error("Run `npm run fix:deployment` to auto-fix this drift.");
    process.exit(1);
}

if (missingFromCompose.length) {
    addToCompose(missingFromCompose);
    console.log(
        `Added to production.docker-compose.yml (app service): ${missingFromCompose.join(", ")}`,
    );
}

if (missingFromEnvExample.length) {
    addToEnvExample(missingFromEnvExample);
    console.log(
        `Added to .env.example: ${missingFromEnvExample.join(", ")}`,
    );
}

const remaining = findDrift();
if (remaining.missingFromCompose.length || remaining.missingFromEnvExample.length) {
    console.error("Auto-fix was unable to resolve all drift.");
    process.exit(1);
}

console.log("Deployment environment configuration drift auto-fixed.");
