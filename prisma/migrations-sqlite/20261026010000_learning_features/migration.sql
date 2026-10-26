-- CreateTable
CREATE TABLE "UserLearningProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserLearningProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyVocabularySet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "localDate" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyVocabularySet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GlobalVocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "term" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "exampleTranslation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailyVocabularyEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailySetId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyVocabularyEntry_dailySetId_fkey" FOREIGN KEY ("dailySetId") REFERENCES "DailyVocabularySet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailyVocabularyEntry_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserVocabularyProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "isLearned" BOOLEAN NOT NULL DEFAULT false,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" DATETIME,
    "lastReviewedAt" DATETIME,
    "learnedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserVocabularyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserVocabularyProgress_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VocabularyReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "remembered" BOOLEAN NOT NULL,
    "localDate" TEXT NOT NULL,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VocabularyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VocabularyReview_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VocabularyReview_userId_vocabularyId_fkey" FOREIGN KEY ("userId", "vocabularyId") REFERENCES "UserVocabularyProgress" ("userId", "vocabularyId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VocabularyFavorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VocabularyFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VocabularyFavorite_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VocabularyFavorite_userId_vocabularyId_fkey" FOREIGN KEY ("userId", "vocabularyId") REFERENCES "UserVocabularyProgress" ("userId", "vocabularyId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "score" INTEGER,
    "total" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "QuizSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizSessionId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "optionsJson" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "QuizQuestion_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "QuizSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizQuestion_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedTerm" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAnswer_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "QuizSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'English practice',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConversationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConversationMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    CONSTRAINT "ConversationMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConversationSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ConversationMessage" ("content", "createdAt", "id", "role", "userId") SELECT "content", "createdAt", "id", "role", "userId" FROM "ConversationMessage";
DROP TABLE "ConversationMessage";
ALTER TABLE "new_ConversationMessage" RENAME TO "ConversationMessage";
CREATE INDEX "ConversationMessage_userId_createdAt_idx" ON "ConversationMessage"("userId", "createdAt");
CREATE INDEX "ConversationMessage_sessionId_createdAt_idx" ON "ConversationMessage"("sessionId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningProfile_userId_key" ON "UserLearningProfile"("userId");

-- CreateIndex
CREATE INDEX "DailyVocabularySet_userId_localDate_idx" ON "DailyVocabularySet"("userId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVocabularySet_userId_localDate_key" ON "DailyVocabularySet"("userId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalVocabulary_term_key" ON "GlobalVocabulary"("term");

-- CreateIndex
CREATE INDEX "GlobalVocabulary_word_idx" ON "GlobalVocabulary"("word");

-- CreateIndex
CREATE INDEX "DailyVocabularyEntry_vocabularyId_idx" ON "DailyVocabularyEntry"("vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVocabularyEntry_dailySetId_vocabularyId_key" ON "DailyVocabularyEntry"("dailySetId", "vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVocabularyEntry_dailySetId_position_key" ON "DailyVocabularyEntry"("dailySetId", "position");

-- CreateIndex
CREATE INDEX "UserVocabularyProgress_userId_nextReviewAt_idx" ON "UserVocabularyProgress"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "UserVocabularyProgress_userId_isLearned_idx" ON "UserVocabularyProgress"("userId", "isLearned");

-- CreateIndex
CREATE UNIQUE INDEX "UserVocabularyProgress_userId_vocabularyId_key" ON "UserVocabularyProgress"("userId", "vocabularyId");

-- CreateIndex
CREATE INDEX "VocabularyReview_userId_localDate_idx" ON "VocabularyReview"("userId", "localDate");

-- CreateIndex
CREATE INDEX "VocabularyReview_userId_reviewedAt_idx" ON "VocabularyReview"("userId", "reviewedAt");

-- CreateIndex
CREATE INDEX "VocabularyFavorite_userId_createdAt_idx" ON "VocabularyFavorite"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularyFavorite_userId_vocabularyId_key" ON "VocabularyFavorite"("userId", "vocabularyId");

-- CreateIndex
CREATE INDEX "QuizSession_userId_createdAt_idx" ON "QuizSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "QuizQuestion_vocabularyId_idx" ON "QuizQuestion"("vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_quizSessionId_position_key" ON "QuizQuestion"("quizSessionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAnswer_questionId_key" ON "QuizAnswer"("questionId");

-- CreateIndex
CREATE INDEX "QuizAnswer_quizSessionId_idx" ON "QuizAnswer"("quizSessionId");

-- CreateIndex
CREATE INDEX "ConversationSession_userId_updatedAt_idx" ON "ConversationSession"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

