#!/usr/bin/env node

/**
 * generate-client.mjs - Versão Avançada 2026
 * Uso: npm run generate client <entidade> [opções]
 * 
 * Exemplos:
 *   npm run generate client frigorifico
 *   npm run generate client cliente --model Cliente --display nomeProdutor
 *   npm run generate client consulta --model Consulta --display dataAbate --force
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRISMA_SCHEMA_PATH = path.resolve(__dirname, "../prisma/schema.prisma");

// ====================== HELPERS ======================
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function pluralize(str) {
    const irregulares = {
        pais: "paises",
        mao: "maos",
        cidadão: "cidadãos",
        consulta: "consultas",
        fazenda: "fazendas",
        frigorifico: "frigorificos",
    };
    const lower = str.toLowerCase();
    if (irregulares[lower]) return irregulares[lower];
    if (lower.endsWith("s") || lower.endsWith("ns")) return lower;
    if (lower.endsWith("m")) return lower.slice(0, -1) + "ns";
    if (lower.endsWith("l")) return lower + "is";
    return lower + "s";
}

// ====================== LER SCHEMA ======================
function parsePrismaSchema() {
    if (!fs.existsSync(PRISMA_SCHEMA_PATH)) {
        console.error("❌ schema.prisma não encontrado!");
        process.exit(1);
    }

    const content = fs.readFileSync(PRISMA_SCHEMA_PATH, "utf8");
    const models = {};

    const modelMatches = content.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\}/g);

    for (const match of modelMatches) {
        const modelName = match[1];
        const body = match[2];

        const fields = [];
        const fieldMatches = body.matchAll(/^\s*(\w+)\s+([\w?]+)(?:\s+@.*)?$/gm);

        for (const fieldMatch of fieldMatches) {
            const name = fieldMatch[1];
            const rawType = fieldMatch[2];
            const type = rawType.replace("?", "");

            fields.push({
                name,
                type,
                isDate: type === "DateTime",
                isBoolean: type === "Boolean",
                isFloat: ["Float", "Decimal"].includes(type),
                isInt: type === "Int",
                isJson: type === "Json",
            });
        }
        models[modelName] = fields;
    }
    return models;
}

// ====================== ARGUMENTOS ======================
const args = process.argv.slice(2);

if (args[0] !== "client" || !args[1]) {
    console.error("\n❌ Uso correto:");
    console.error("   npm run generate client <entidade> [--model NomeModelo] [--display campo] [--force]\n");
    process.exit(1);
}

let entidade = args[1].toLowerCase();
let prismaModel = capitalize(entidade);
let displayField = "nome";
let force = false;

for (let i = 2; i < args.length; i++) {
    if (args[i] === "--model" && args[i + 1]) prismaModel = args[i + 1];
    if (args[i] === "--display" && args[i + 1]) displayField = args[i + 1];
    if (args[i] === "--force") force = true;
}

const NomeEntidade = capitalize(entidade);
const nomeRota = pluralize(entidade);

const baseDir = path.resolve(__dirname, `../src/app/(dashboard)/${nomeRota}`);
const apiDir = path.resolve(__dirname, `../src/app/api/${nomeRota}`);
const componentsDir = path.join(baseDir, "_components");

if (fs.existsSync(baseDir) && !force) {
    console.error(`\n❌ Pasta já existe: ${baseDir}`);
    console.error("   Use --force para sobrescrever.\n");
    process.exit(1);
}

// Ler modelo do Prisma
const models = parsePrismaSchema();
const fields = models[prismaModel] || models[capitalize(prismaModel)] || [];

console.log(`🔄 Gerando CRUD para: ${prismaModel} → /${nomeRota}`);

// ====================== TEMPLATES ======================
const pageTemplate = `import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ${NomeEntidade}Client } from "./_components/${NomeEntidade}Client";

export const dynamic = "force-dynamic";

export default async function ${NomeEntidade}sPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const items = await prisma.${prismaModel.toLowerCase()}.findMany({
        select: {
            id: true,
            ${fields.slice(0, 12).map(f => `${f.name}: true,`).join("\n            ")}
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    const initialData = items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt?.toISOString(),
    }));

    return <${NomeEntidade}Client initialData={initialData} />;
}
`;

const columnsTemplate = `"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ${NomeEntidade}Item {
    id: string;
${fields.map(f => `    ${f.name}: ${f.isDate ? "string" : f.isBoolean ? "boolean" : "any"};`).join("\n")}
}

interface ColumnActions {
    onVisualizar: (item: ${NomeEntidade}Item) => void;
    onEditar: (item: ${NomeEntidade}Item) => void;
    onExcluir: (item: ${NomeEntidade}Item) => void;
}

export function createColumns({ onVisualizar, onEditar, onExcluir }: ColumnActions): ColumnDef<${NomeEntidade}Item>[] {
    return [
${fields.filter(f => !["id", "createdAt", "updatedAt"].includes(f.name)).slice(0, 8).map(f => {
    if (f.isBoolean) return `        { accessorKey: "${f.name}", header: "${capitalize(f.name)}", cell: ({row}) => row.original.${f.name} ? "✅ Ativo" : "❌ Inativo" },`;
    if (f.isDate) return `        { accessorKey: "${f.name}", header: "${capitalize(f.name)}", cell: ({row}) => format(new Date(row.original.${f.name}), "dd/MM/yyyy", { locale: ptBR }) },`;
    return `        { accessorKey: "${f.name}", header: "${capitalize(f.name)}" },`;
}).join("\n")}

        {
            id: "acoes",
            header: "Ações",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onVisualizar(row.original); }} title="Visualizar" className="p-1.5 hover:bg-primary/10 rounded-lg"><Eye size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onEditar(row.original); }} title="Editar" className="p-1.5 hover:bg-blue-500/10 rounded-lg"><Pencil size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onExcluir(row.original); }} title="Excluir" className="p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
                </div>
            ),
        },
    ];
}
`;

const clientTemplate = `"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { createColumns, ${NomeEntidade}Item } from "./columns";

interface ${NomeEntidade}ClientProps {
    initialData: ${NomeEntidade}Item[];
}

export function ${NomeEntidade}Client({ initialData }: ${NomeEntidade}ClientProps) {
    const router = useRouter();
    const [itemParaExcluir, setItemParaExcluir] = useState<${NomeEntidade}Item | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleVisualizar = useCallback((item: ${NomeEntidade}Item) => router.push(\`/${nomeRota}/\${item.id}\`), [router]);
    const handleEditar = useCallback((item: ${NomeEntidade}Item) => router.push(\`/${nomeRota}/\${item.id}/editar\`), [router]);
    const handleExcluir = useCallback((item: ${NomeEntidade}Item) => setItemParaExcluir(item), []);

    const handleConfirmarExclusao = useCallback(async () => {
        if (!itemParaExcluir) return;
        setIsDeleting(true);
        try {
            const res = await fetch(\`/api/${nomeRota}?id=\${itemParaExcluir.id}\`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            router.refresh();
            setItemParaExcluir(null);
        } catch {
            alert("Erro ao excluir o registro.");
        } finally {
            setIsDeleting(false);
        }
    }, [itemParaExcluir, router]);

    const columns = useMemo(() => 
        createColumns({ onVisualizar: handleVisualizar, onEditar: handleEditar, onExcluir: handleExcluir }), 
    []);

    const headerActions = (
        <button
            onClick={() => router.push(\`/${nomeRota}/novo\`)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all"
        >
            + Novo ${NomeEntidade}
        </button>
    );

    return (
        <div className="bg-background">
            <PageHeader title="${NomeEntidade}s" subtitle="Gerencie os registros de ${nomeRota}." />

            <div className="px-4 pt-4">
                <DataTable
                    columns={columns}
                    data={initialData}
                    searchPlaceholder="Buscar ${nomeRota}..."
                    headerActions={headerActions}
                />
            </div>

            {/* Modal de Exclusão */}
            {itemParaExcluir && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Confirmar exclusão</h2>
                        <p className="text-sm text-gray-600">
                            Tem certeza que deseja excluir <strong>
                            "${itemParaExcluir[displayField] || 'este registro'}"</strong>?
                            <br />Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setItemParaExcluir(null)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmarExclusao}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
                            >
                                {isDeleting ? "Excluindo..." : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
`;

const apiTemplate = `import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const items = await prisma.${prismaModel.toLowerCase()}.findMany({
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    try {
        const data = await request.json();
        const item = await prisma.${prismaModel.toLowerCase()}.create({ data });
        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar registro" }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    await prisma.${prismaModel.toLowerCase()}.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
`;

// ====================== CRIAR ESTRUTURA ======================
fs.mkdirSync(componentsDir, { recursive: true });
fs.mkdirSync(apiDir, { recursive: true });

fs.writeFileSync(path.join(baseDir, "page.tsx"), pageTemplate, "utf8");
fs.writeFileSync(path.join(componentsDir, `${NomeEntidade}Client.tsx`), clientTemplate, "utf8");
fs.writeFileSync(path.join(componentsDir, "columns.tsx"), columnsTemplate, "utf8");
fs.writeFileSync(path.join(apiDir, "route.ts"), apiTemplate, "utf8");

console.log(`
✅ Gerado com sucesso!

📁 Frontend: src/app/(dashboard)/${nomeRota}/
📁 API:      src/app/api/${nomeRota}/route.ts

Use --force para sobrescrever pastas existentes.
`);