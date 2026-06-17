/*
  Warnings:

  - You are about to drop the column `consultorId` on the `auditoria_logs` table. All the data in the column will be lost.
  - You are about to drop the `consultores` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CONSULTOR', 'CLIENTE');

-- DropForeignKey
ALTER TABLE "auditoria_logs" DROP CONSTRAINT "auditoria_logs_consultorId_fkey";

-- DropForeignKey
ALTER TABLE "consultas" DROP CONSTRAINT "consultas_consultorId_fkey";

-- DropForeignKey
ALTER TABLE "consultores" DROP CONSTRAINT "consultores_empresaId_fkey";

-- AlterTable
ALTER TABLE "auditoria_logs" DROP COLUMN "consultorId",
ADD COLUMN     "usuarioId" TEXT;

-- DropTable
DROP TABLE "consultores";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "clienteId" TEXT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CONSULTOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "invitedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "registrationIp" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_consultorId_fkey" FOREIGN KEY ("consultorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_logs" ADD CONSTRAINT "auditoria_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
