/*
  Warnings:

  - You are about to drop the column `videoId` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `assignmentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `parentCommentId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `videoVersionId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentCommentId_fkey";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "videoId";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "assignmentId",
DROP COLUMN "parentCommentId",
ADD COLUMN     "videoVersionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "AssignmentVideoVersion" (
    "id" SERIAL NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentVideoVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssignmentVideoVersion" ADD CONSTRAINT "AssignmentVideoVersion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentVideoVersion" ADD CONSTRAINT "AssignmentVideoVersion_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_videoVersionId_fkey" FOREIGN KEY ("videoVersionId") REFERENCES "AssignmentVideoVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
