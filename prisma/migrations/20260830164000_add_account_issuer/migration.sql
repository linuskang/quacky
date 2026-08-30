-- Better Auth 1.7 account identity backfill.
ALTER TABLE "account" ADD COLUMN "issuer" TEXT;

UPDATE "account"
SET "issuer" = CASE
    WHEN "providerId" = 'credential' THEN 'local:credential'
    WHEN "providerId" = 'google' THEN 'local:oauth:google'
    ELSE NULL
END,
"accountId" = CASE
    WHEN "providerId" = 'credential' THEN "userId"
    ELSE "accountId"
END;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "account" WHERE "issuer" IS NULL) THEN
        RAISE EXCEPTION 'Cannot migrate account identity: an unsupported providerId exists';
    END IF;

    IF EXISTS (
        SELECT "issuer", "accountId"
        FROM "account"
        GROUP BY "issuer", "accountId"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot migrate account identity: duplicate issuer/accountId exists';
    END IF;
END $$;

ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;

CREATE UNIQUE INDEX "account_issuer_accountId_uidx"
ON "account"("issuer", "accountId");
