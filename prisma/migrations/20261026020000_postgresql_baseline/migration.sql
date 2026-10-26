-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL,
    "dailySetId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "exampleTranslation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "isLearned" BOOLEAN NOT NULL DEFAULT false,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLearningProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLearningProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyVocabularySet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "localDate" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyVocabularySet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalVocabulary" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "exampleTranslation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyVocabularyEntry" (
    "id" TEXT NOT NULL,
    "dailySetId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyVocabularyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVocabularyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "isLearned" BOOLEAN NOT NULL DEFAULT false,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "learnedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVocabularyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "remembered" BOOLEAN NOT NULL,
    "localDate" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabularyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabularyFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "score" INTEGER,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizSessionId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "optionsJson" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "quizSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedTerm" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'English practice',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "ConversationMessage_sessionId_createdAt_idx" ON "ConversationMessage"("sessionId", "createdAt");

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

-- AddForeignKey
ALTER TABLE "DailySet" ADD CONSTRAINT "DailySet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_dailySetId_fkey" FOREIGN KEY ("dailySetId") REFERENCES "DailySet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordProgress" ADD CONSTRAINT "WordProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordProgress" ADD CONSTRAINT "WordProgress_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConversationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningProfile" ADD CONSTRAINT "UserLearningProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyVocabularySet" ADD CONSTRAINT "DailyVocabularySet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyVocabularyEntry" ADD CONSTRAINT "DailyVocabularyEntry_dailySetId_fkey" FOREIGN KEY ("dailySetId") REFERENCES "DailyVocabularySet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyVocabularyEntry" ADD CONSTRAINT "DailyVocabularyEntry_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocabularyProgress" ADD CONSTRAINT "UserVocabularyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocabularyProgress" ADD CONSTRAINT "UserVocabularyProgress_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyReview" ADD CONSTRAINT "VocabularyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyReview" ADD CONSTRAINT "VocabularyReview_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyReview" ADD CONSTRAINT "VocabularyReview_userId_vocabularyId_fkey" FOREIGN KEY ("userId", "vocabularyId") REFERENCES "UserVocabularyProgress"("userId", "vocabularyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyFavorite" ADD CONSTRAINT "VocabularyFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyFavorite" ADD CONSTRAINT "VocabularyFavorite_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyFavorite" ADD CONSTRAINT "VocabularyFavorite_userId_vocabularyId_fkey" FOREIGN KEY ("userId", "vocabularyId") REFERENCES "UserVocabularyProgress"("userId", "vocabularyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "QuizSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "GlobalVocabulary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "QuizSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationSession" ADD CONSTRAINT "ConversationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
