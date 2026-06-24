import { resolve } from 'path'
import { config } from 'dotenv'
import { limparBanco } from './db-helpers'


export default async function globalTeardown() {
    config({ path: resolve(process.cwd(), '.env.test') })

    console.log('🧹 Limpando banco após os testes...')
    await limparBanco()
    console.log('✅ Banco limpo!')
}