/*
  Warnings:

  - The `visibility` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `coverImageUrl` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `CommentReaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `PostReaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `passwordHash` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "REACTION" AS ENUM ('LIKE', 'LOVE', 'CARE', 'HAHA', 'ANGRY', 'SAD', 'WOW');

-- DropIndex
DROP INDEX "Post_authorId_idx";

-- DropIndex
DROP INDEX "PostImage_postId_idx";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentCommentId" TEXT;

-- AlterTable
ALTER TABLE "CommentReaction" DROP COLUMN "type",
ADD COLUMN     "type" "REACTION" NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "visibility",
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "PostReaction" DROP COLUMN "type",
ADD COLUMN     "type" "REACTION" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "coverImageUrl",
ADD COLUMN     "coverUrl" TEXT,
ALTER COLUMN "passwordHash" SET NOT NULL;

-- DropEnum
DROP TYPE "PostVisibility";

-- DropEnum
DROP TYPE "ReactionType";

-- CreateIndex
CREATE INDEX "Comment_parentCommentId_idx" ON "Comment"("parentCommentId");

-- CreateIndex
CREATE INDEX "Post_authorId_createdAt_idx" ON "Post"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_visibility_createdAt_idx" ON "Post"("visibility", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
