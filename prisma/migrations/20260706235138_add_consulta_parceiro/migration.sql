-- AlterTable
ALTER TABLE "clientes" ALTER COLUMN "documento" DROP DEFAULT;

-- CreateTable
CREATE TABLE "consulta_parceiros" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consulta_parceiros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consulta_parceiros_consultaId_clienteId_key" ON "consulta_parceiros"("consultaId", "clienteId");

-- AddForeignKey
ALTER TABLE "consulta_parceiros" ADD CONSTRAINT "consulta_parceiros_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consultas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta_parceiros" ADD CONSTRAINT "consulta_parceiros_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
