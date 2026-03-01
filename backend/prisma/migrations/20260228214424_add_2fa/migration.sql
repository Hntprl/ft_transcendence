/*
  Warnings:

  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpires` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "auth"."User_resetToken_key";

-- AlterTable
ALTER TABLE "auth"."User" DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpires",
ADD COLUMN     "isTwoFactorAuthEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorAuthSecret" TEXT;
