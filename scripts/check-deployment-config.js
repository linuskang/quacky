import { readFileSync } from "node:fs";

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
    [...productionCompose.matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-[^}]*)?\}/g)].map(
        ([, key]) => key,
    ),
);

const deploymentOnlyKeys = new Set(["PORT", "POSTGRES_PORT"]);
const localOnlyKeys = new Set([
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
]);
const missingFromCompose = [...envKeys].filter(
    (key) => !composeKeys.has(key) && !localOnlyKeys.has(key),
);
const missingFromEnvExample = [...composeKeys].filter(
    (key) => !envKeys.has(key) && !deploymentOnlyKeys.has(key),
);

if (missingFromCompose.length || missingFromEnvExample.length) {
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

    process.exit(1);
}

console.log("Deployment environment configuration is synchronized.");
