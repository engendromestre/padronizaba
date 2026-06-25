-- Cria o banco de testes se não existir
SELECT 'CREATE DATABASE padronizaba_test'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'padronizaba_test'
)\gexec

-- Garante que o usuário tem acesso
GRANT ALL PRIVILEGES ON DATABASE padronizaba_test TO padronizaba;