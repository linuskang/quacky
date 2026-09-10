ALTER TABLE "user"
ADD COLUMN "isSimulationAccount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "simulationActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "simulationPersona" JSONB;

CREATE TABLE "simulation_post" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "groundTruth" TEXT NOT NULL,
    "category" TEXT,
    "generationModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "simulation_post_postId_key" ON "simulation_post"("postId");
CREATE INDEX "simulation_post_createdAt_idx" ON "simulation_post"("createdAt");

ALTER TABLE "simulation_post"
ADD CONSTRAINT "simulation_post_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "simulation_run" (
    "id" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "simulation_run_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "simulation_run_slotKey_key" ON "simulation_run"("slotKey");

CREATE TABLE "simulation_report_reward" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_report_reward_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "simulation_report_reward_postId_reporterId_key"
ON "simulation_report_reward"("postId", "reporterId");
CREATE INDEX "simulation_report_reward_reporterId_createdAt_idx"
ON "simulation_report_reward"("reporterId", "createdAt");

ALTER TABLE "simulation_report_reward"
ADD CONSTRAINT "simulation_report_reward_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "simulation_report_reward"
ADD CONSTRAINT "simulation_report_reward_reporterId_fkey"
FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
