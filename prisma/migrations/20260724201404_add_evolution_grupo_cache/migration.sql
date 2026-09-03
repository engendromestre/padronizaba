-- CreateTable
CREATE TABLE "evolution_grupos_cache" (
    "id" TEXT NOT NULL,
    "groupIdWhatsapp" TEXT NOT NULL,
    "nomeGrupo" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evolution_grupos_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evolution_grupos_cache_groupIdWhatsapp_key" ON "evolution_grupos_cache"("groupIdWhatsapp");
