-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'EDITOR', 'USER');

-- CreateEnum
CREATE TYPE "public"."StoryStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Story" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ageMin" INTEGER NOT NULL,
    "ageMax" INTEGER NOT NULL,
    "isInteractive" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."StoryStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StoryBody" (
    "storyId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "readingTimeSec" INTEGER,

    CONSTRAINT "StoryBody_pkey" PRIMARY KEY ("storyId")
);

-- CreateTable
CREATE TABLE "public"."InteractiveNode" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,

    CONSTRAINT "InteractiveNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InteractiveChoice" (
    "id" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,

    CONSTRAINT "InteractiveChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReadingProgress" (
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "lastPos" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("userId","storyId")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "props" JSONB NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExperimentConfig" (
    "key" TEXT NOT NULL,
    "variants" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperimentConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."UserExperimentAssignment" (
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "variant" TEXT NOT NULL,

    CONSTRAINT "UserExperimentAssignment_pkey" PRIMARY KEY ("userId","key")
);

-- CreateTable
CREATE TABLE "public"."FreeRotation" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FreeRotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "public"."Story"("slug");

-- CreateIndex
CREATE INDEX "InteractiveNode_storyId_idx" ON "public"."InteractiveNode"("storyId");

-- CreateIndex
CREATE INDEX "InteractiveChoice_fromNodeId_idx" ON "public"."InteractiveChoice"("fromNodeId");

-- CreateIndex
CREATE INDEX "InteractiveChoice_toNodeId_idx" ON "public"."InteractiveChoice"("toNodeId");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "public"."Event"("userId");

-- CreateIndex
CREATE INDEX "Event_name_ts_idx" ON "public"."Event"("name", "ts");

-- CreateIndex
CREATE UNIQUE INDEX "FreeRotation_storyId_key" ON "public"."FreeRotation"("storyId");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoryBody" ADD CONSTRAINT "StoryBody_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InteractiveNode" ADD CONSTRAINT "InteractiveNode_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InteractiveChoice" ADD CONSTRAINT "InteractiveChoice_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "public"."InteractiveNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InteractiveChoice" ADD CONSTRAINT "InteractiveChoice_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "public"."InteractiveNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadingProgress" ADD CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadingProgress" ADD CONSTRAINT "ReadingProgress_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserExperimentAssignment" ADD CONSTRAINT "UserExperimentAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FreeRotation" ADD CONSTRAINT "FreeRotation_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
