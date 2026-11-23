/*
  Warnings:

  - A unique constraint covering the columns `[empresaId,offlineId]` on the table `consultas` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "consultas" ADD COLUMN     "offlineId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "consultas_empresaId_offlineId_key" ON "consultas"("empresaId", "offlineId");
