/*
  Warnings:

  - You are about to drop the column `empresaId` on the `auditoria_logs` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `frigorifico` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `nomeFazenda` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `acabamentoJson` on the `consultas` table. All the data in the column will be lost.
  - You are about to drop the column `bezerrosJson` on the `consultas` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `consultas` table. All the data in the column will be lost.
  - You are about to drop the column `frigorifico` on the `consultas` table. All the data in the column will be lost.
  - You are about to drop the column `maturidadeJson` on the `consultas` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `empresas` table. All the data in the column will be lost.
  - Added the required column `categoriaAnimalId` to the `consultas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fazendaId` to the `consultas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frigorificoId` to the `consultas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pesoTotalLoteKg` to the `consultas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estadoId` to the `empresas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auditoria_logs" DROP COLUMN "empresaId";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "cidade",
DROP COLUMN "frigorifico",
DROP COLUMN "nomeFazenda";

-- AlterTable
ALTER TABLE "consultas" DROP COLUMN "acabamentoJson",
DROP COLUMN "bezerrosJson",
DROP COLUMN "cidade",
DROP COLUMN "frigorifico",
DROP COLUMN "maturidadeJson",
ADD COLUMN     "bezerrosG" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bezerrosM" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bezerrosP" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "categoriaAnimalId" TEXT NOT NULL,
ADD COLUMN     "dentes0" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dentes2" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dentes4" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dentes6" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dentes8" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fazendaId" TEXT NOT NULL,
ADD COLUMN     "frigorificoId" TEXT NOT NULL,
ADD COLUMN     "gordura1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gordura2" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gordura3" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gordura4" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gordura5" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pesoTotalLoteKg" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "empresas" DROP COLUMN "estado",
ADD COLUMN     "estadoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "estados" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cidades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ibge" TEXT,
    "estadoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frigorificos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "cidadeId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frigorificos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fazendas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "cidadeId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fazendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_animal" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_logs" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "messageId" TEXT,
    "erro" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estados_uf_key" ON "estados"("uf");

-- CreateIndex
CREATE UNIQUE INDEX "cidades_ibge_key" ON "cidades"("ibge");

-- CreateIndex
CREATE UNIQUE INDEX "frigorificos_cnpj_key" ON "frigorificos"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_animal_nome_key" ON "categorias_animal"("nome");

-- AddForeignKey
ALTER TABLE "cidades" ADD CONSTRAINT "cidades_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frigorificos" ADD CONSTRAINT "frigorificos_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "cidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fazendas" ADD CONSTRAINT "fazendas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fazendas" ADD CONSTRAINT "fazendas_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "cidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "fazendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_frigorificoId_fkey" FOREIGN KEY ("frigorificoId") REFERENCES "frigorificos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_categoriaAnimalId_fkey" FOREIGN KEY ("categoriaAnimalId") REFERENCES "categorias_animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_logs" ADD CONSTRAINT "whatsapp_logs_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
