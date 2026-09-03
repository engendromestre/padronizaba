-- DropForeignKey
ALTER TABLE "consulta_parceiros" DROP CONSTRAINT "consulta_parceiros_clienteId_fkey";

-- AddForeignKey
ALTER TABLE "consulta_parceiros" ADD CONSTRAINT "consulta_parceiros_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
