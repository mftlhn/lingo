-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailySet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailySet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailySetId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "exampleTranslation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vocabulary_dailySetId_fkey" FOREIGN KEY ("dailySetId") REFERENCES "DailySet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "isLearned" BOOLEAN NOT NULL DEFAULT false,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" DATETIME,
    "lastReviewedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WordProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WordProgress_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "DailySet_userId_date_idx" ON "DailySet"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySet_userId_date_key" ON "DailySet"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Vocabulary_dailySetId_word_key" ON "Vocabulary"("dailySetId", "word");

-- CreateIndex
CREATE UNIQUE INDEX "WordProgress_vocabularyId_key" ON "WordProgress"("vocabularyId");

-- CreateIndex
CREATE INDEX "WordProgress_userId_nextReviewAt_idx" ON "WordProgress"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "ConversationMessage_userId_createdAt_idx" ON "ConversationMessage"("userId", "createdAt");

