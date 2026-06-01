-- CreateTable
CREATE TABLE "TrainingSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "labels" JSONB NOT NULL,
    "accuracy" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingSubmission_userId_activityId_idx" ON "TrainingSubmission"("userId", "activityId");

-- CreateIndex
CREATE INDEX "TrainingSubmission_activityId_idx" ON "TrainingSubmission"("activityId");

-- AddForeignKey
ALTER TABLE "TrainingSubmission" ADD CONSTRAINT "TrainingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
