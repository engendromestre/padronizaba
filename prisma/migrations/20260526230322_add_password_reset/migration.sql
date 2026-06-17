/*
  Warnings:

  - A unique constraint covering the columns `[senhaResetToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "senhaResetExpires" TIMESTAMP(3),
ADD COLUMN     "senhaResetToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_senhaResetToken_key" ON "users"("senhaResetToken");
