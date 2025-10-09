#!/bin/sh

# Script de inicialização do Docker
# Este script será executado quando o container da aplicação iniciar

echo "Iniciando aplicação Mechanical Workshop API..."

# Aguardar o banco de dados estar pronto
echo "Aguardando banco de dados..."
while ! nc -z postgres 5432; do
  echo "Aguardando PostgreSQL..."
  sleep 2
done
echo "Banco de dados conectado!"

# Verificar se o arquivo principal existe
if [ ! -f "dist/main.js" ]; then
  echo "Arquivo dist/main.js não encontrado!"
  echo "Conteúdo do diretório /app:"
  ls -la
  echo "Conteúdo do diretório dist:"
  ls -la dist/ || echo "Diretório dist não existe"
  exit 1
fi

# Executar migrações do Prisma (ignorar erro se schema já existe)
echo "Executando migrações do banco de dados..."
npx prisma migrate deploy || echo "Migrações já aplicadas ou erro (continuando...)"

# Gerar cliente Prisma (se necessário)
echo "Gerando cliente Prisma..."
npx prisma generate || echo "Cliente Prisma já gerado ou erro (continuando...)"

# Criar usuário admin se não existir (opcional)
echo "Verificando usuário admin..."
if [ -f "scripts/create-admin.js" ]; then
  node scripts/create-admin.js || echo "Usuário admin já existe ou erro na criação"
else
  echo "Script create-admin.js não encontrado, pulando..."
fi

echo "Inicialização completa!"

# Iniciar a aplicação
echo "Iniciando servidor NestJS..."
exec node dist/main.js