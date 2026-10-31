-- Add learner level and first-login placement state.
ALTER TABLE "UserLearningProfile"
ADD COLUMN "learningLevel" TEXT NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN "placementRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "placementCompletedAt" TIMESTAMP(3);

-- Persist one generated grammar set for each learner's local calendar date.
CREATE TABLE "GrammarDailySet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "localDate" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GrammarDailySet_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GrammarDailySet_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "GrammarDailySet_userId_localDate_key"
ON "GrammarDailySet"("userId", "localDate");
CREATE INDEX "GrammarDailySet_userId_localDate_idx"
ON "GrammarDailySet"("userId", "localDate");

CREATE TABLE "GrammarQuestion" (
    "id" TEXT NOT NULL,
    "dailySetId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "optionsJson" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    CONSTRAINT "GrammarQuestion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GrammarQuestion_dailySetId_fkey"
      FOREIGN KEY ("dailySetId") REFERENCES "GrammarDailySet"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "GrammarQuestion_dailySetId_position_key"
ON "GrammarQuestion"("dailySetId", "position");

CREATE TABLE "GrammarAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailySetId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GrammarAttempt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GrammarAttempt_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GrammarAttempt_dailySetId_fkey"
      FOREIGN KEY ("dailySetId") REFERENCES "GrammarDailySet"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "GrammarAttempt_userId_completedAt_idx"
ON "GrammarAttempt"("userId", "completedAt");
CREATE INDEX "GrammarAttempt_dailySetId_completedAt_idx"
ON "GrammarAttempt"("dailySetId", "completedAt");

CREATE TABLE "GrammarAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    CONSTRAINT "GrammarAnswer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GrammarAnswer_attemptId_fkey"
      FOREIGN KEY ("attemptId") REFERENCES "GrammarAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GrammarAnswer_questionId_fkey"
      FOREIGN KEY ("questionId") REFERENCES "GrammarQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "GrammarAnswer_attemptId_questionId_key"
ON "GrammarAnswer"("attemptId", "questionId");
CREATE INDEX "GrammarAnswer_questionId_idx"
ON "GrammarAnswer"("questionId");
