/*
  Warnings:

  - A unique constraint covering the columns `[documento,empresaId]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "documento" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "clientes_documento_empresaId_key" ON "clientes"("documento", "empresaId");
