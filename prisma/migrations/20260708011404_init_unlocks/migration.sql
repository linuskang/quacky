-- AlterTable
ALTER TABLE "user" ADD COLUMN     "unlockedCommenting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlockedDms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlockedFuzzies" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlockedPosting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlockedProfiles" BOOLEAN NOT NULL DEFAULT false;
