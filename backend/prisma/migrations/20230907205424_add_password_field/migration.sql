/*
  Warnings:

  - Added the required column `encrytped_password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "encrytped_password" TEXT NOT NULL;
