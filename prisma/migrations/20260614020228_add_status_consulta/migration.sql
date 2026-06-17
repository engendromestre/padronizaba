-- CreateEnum
CREATE TYPE "StatusConsulta" AS ENUM ('ENVIADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "consultas" ADD COLUMN     "canceladoEm" TIMESTAMP(3),
ADD COLUMN     "canceladoPor" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "motivoCancelamento" TEXT,
ADD COLUMN     "status" "StatusConsulta" NOT NULL DEFAULT 'ENVIADA';

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_canceladoPor_fkey" FOREIGN KEY ("canceladoPor") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
