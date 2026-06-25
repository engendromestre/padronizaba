import { execSync } from 'child_process'
import { resolve } from 'path'
import { config } from 'dotenv'
import { limparBanco } from './db-helpers'

export default async function globalSetup() {
    config({ path: resolve(process.cwd(), '.env.test') })

    console.log('🧹 Limpando banco de testes...')
    await limparBanco()

    console.log('🔧 Rodando migrations...')
    execSync('npx prisma migrate deploy', {
        env: { ...process.env },
        stdio: 'inherit',
    })

    console.log('🌱 Populando dados de teste...')
    execSync('npx tsx prisma/seed.ts', {
        env: { ...process.env },
        stdio: 'inherit',
    })

    console.log('✅ Banco de testes pronto!')
}