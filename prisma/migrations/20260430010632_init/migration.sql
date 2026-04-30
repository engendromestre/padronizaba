-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nomeProdutor" TEXT NOT NULL,
    "nomeFazenda" TEXT NOT NULL,
    "frigorifico" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_whatsapp" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "groupIdWhatsapp" TEXT NOT NULL,
    "nomeGrupo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultores" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "consultorId" TEXT NOT NULL,
    "dataAbate" TIMESTAMP(3) NOT NULL,
    "frigorifico" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "qtdMachos" INTEGER NOT NULL DEFAULT 0,
    "qtdFemeas" INTEGER NOT NULL DEFAULT 0,
    "pesoVivoKg" DOUBLE PRECISION NOT NULL,
    "pesoCarcacaKg" DOUBLE PRECISION NOT NULL,
    "mediaArroba" DOUBLE PRECISION NOT NULL,
    "rcPercentual" DOUBLE PRECISION NOT NULL,
    "maturidadeJson" JSONB NOT NULL,
    "acabamentoJson" JSONB NOT NULL,
    "penalizacoes" TEXT,
    "dif" TEXT,
    "escoreRuminal" TEXT,
    "perdaVacinalKg" DOUBLE PRECISION,
    "bezerrosJson" JSONB,
    "contaminacaoGiKg" DOUBLE PRECISION,
    "hematomasKg" DOUBLE PRECISION,
    "deslocamento" BOOLEAN NOT NULL DEFAULT false,
    "relatorioAbate" BOOLEAN NOT NULL DEFAULT false,
    "dataFaturamento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulta_financeiro" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "totalBruto" DOUBLE PRECISION NOT NULL,
    "nota" DOUBLE PRECISION,
    "totalLiquido" DOUBLE PRECISION,
    "ticketMedio" DOUBLE PRECISION,
    "meses" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consulta_financeiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_logs" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "consultorId" TEXT,
    "consultaId" TEXT,
    "tabelaAfetada" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "ipOrigem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grupos_whatsapp_groupIdWhatsapp_key" ON "grupos_whatsapp"("groupIdWhatsapp");

-- CreateIndex
CREATE UNIQUE INDEX "consultores_email_key" ON "consultores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "consulta_financeiro_consultaId_key" ON "consulta_financeiro"("consultaId");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_whatsapp" ADD CONSTRAINT "grupos_whatsapp_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultores" ADD CONSTRAINT "consultores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_consultorId_fkey" FOREIGN KEY ("consultorId") REFERENCES "consultores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta_financeiro" ADD CONSTRAINT "consulta_financeiro_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_logs" ADD CONSTRAINT "auditoria_logs_consultorId_fkey" FOREIGN KEY ("consultorId") REFERENCES "consultores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_logs" ADD CONSTRAINT "auditoria_logs_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
