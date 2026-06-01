/*
  Warnings:

  - You are about to drop the `TrainingSubmission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TrainingSubmission" DROP CONSTRAINT "TrainingSubmission_userId_fkey";

-- DropTable
DROP TABLE "TrainingSubmission";

-- CreateTable
CREATE TABLE "GameSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSubmission_userId_activityId_idx" ON "GameSubmission"("userId", "activityId");

-- CreateIndex
CREATE INDEX "GameSubmission_activityId_idx" ON "GameSubmission"("activityId");

-- AddForeignKey
ALTER TABLE "GameSubmission" ADD CONSTRAINT "GameSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
