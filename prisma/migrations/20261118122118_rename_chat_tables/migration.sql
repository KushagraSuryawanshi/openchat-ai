/*
  Warnings:

  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- Rewritign this file because prisma generate sql was dropping the tables instead of renaming them

-- Rename tables without losing data
ALTER TABLE "Conversation" RENAME TO "conversation";
ALTER TABLE "Message" RENAME TO "message";

-- Rename primary key constraints
ALTER TABLE "conversation" RENAME CONSTRAINT "Conversation_pkey" TO "conversation_pkey";
ALTER TABLE "message" RENAME CONSTRAINT "Message_pkey" TO "message_pkey";

-- Rename foreign key constraints
ALTER TABLE "conversation" RENAME CONSTRAINT "Conversation_userId_fkey" TO "conversation_userId_fkey";
ALTER TABLE "message" RENAME CONSTRAINT "Message_conversationId_fkey" TO "message_conversationId_fkey";

-- Rename indexes
ALTER INDEX "Conversation_userId_idx" RENAME TO "conversation_userId_idx";
ALTER INDEX "Message_conversationId_createdAt_idx" RENAME TO "message_conversationId_createdAt_idx";