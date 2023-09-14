/*
  Warnings:

  - You are about to drop the column `type` on the `User` table. All the data in the column will be lost.
  - Added the required column `reporterId` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "assigneeId" INTEGER,
ADD COLUMN     "reporterId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "type";

-- DropEnum
DROP TYPE "UserType";

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
