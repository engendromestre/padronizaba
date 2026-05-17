/*
  Warnings:

  - You are about to drop the column `qtdFemeas` on the `consultas` table. All the data in the column will be lost.
  - You are about to drop the column `qtdMachos` on the `consultas` table. All the data in the column will be lost.
  - Added the required column `sexoAnimais` to the `consultas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "consultas" DROP COLUMN "qtdFemeas",
DROP COLUMN "qtdMachos",
ADD COLUMN     "qtdAnimais" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sexoAnimais" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_ConsultaGrupos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConsultaGrupos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ConsultaGrupos_B_index" ON "_ConsultaGrupos"("B");

-- AddForeignKey
ALTER TABLE "_ConsultaGrupos" ADD CONSTRAINT "_ConsultaGrupos_A_fkey" FOREIGN KEY ("A") REFERENCES "consultas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultaGrupos" ADD CONSTRAINT "_ConsultaGrupos_B_fkey" FOREIGN KEY ("B") REFERENCES "grupos_whatsapp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
