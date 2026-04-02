/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Comment_authorId_idx";

-- DropIndex
DROP INDEX "CommentReaction_userId_idx";

-- DropIndex
DROP INDEX "Post_createdAt_idx";

-- DropIndex
DROP INDEX "Post_visibility_createdAt_idx";

-- DropIndex
DROP INDEX "PostReaction_userId_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
