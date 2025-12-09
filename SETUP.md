# Guia de Instalação - Pet Management API

## 🚀 Setup com MySQL (Produção)

### Passo 1: Instalar MySQL

**Opção 1 - XAMPP (Mais Fácil):**
1. Baixe: https://www.apachefriends.org/download.html
2. Instale (apenas MySQL)
3. Abra XAMPP Control Panel
4. Clique em "Start" no MySQL

**Opção 2 - MySQL Standalone:**
1. Baixe: https://dev.mysql.com/downloads/installer/
2. Instale MySQL Server
3. Senha padrão: deixe em branco ou defina uma

**Opção 3 - Docker (Recomendado):**
```bash
docker run --name mysql-pet -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=pet_management -p 3306:3306 -d mysql:8
```

### Passo 2: Configurar .env

Se usa XAMPP ou sem senha:
```env
DATABASE_URL="mysql://root:@localhost:3306/pet_management"
```

Se definiu senha:
```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/pet_management"
```

Se usa Docker:
```env
DATABASE_URL="mysql://root:root@localhost:3306/pet_management"
```

### Passo 3: Criar Database e Tabelas
```bash
npx prisma migrate dev --name initial
```

### Passo 4: Iniciar Servidor
```bash
npm run dev
```

---

## 🔧 Comandos Úteis

### Ver database no Prisma Studio
```bash
npx prisma studio
```

### Reset database (CUIDADO: apaga tudo)
```bash
npx prisma migrate reset
```

### Gerar Prisma Client após mudanças
```bash
npx prisma generate
```

---

## ❌ Problemas Comuns

### Erro: "Can't reach database server"
**Solução:** MySQL não está rodando
- Inicie via XAMPP Control Panel
- Ou: `Start-Service MySQL80` (se instalou standalone)

### Erro: "Access denied for user 'root'"
**Solução:** Senha incorreta no .env
- XAMPP: sem senha (deixe vazio após root:)
- MySQL: use a senha que você definiu

### Erro: "Port 3000 already in use"
**Solução:** Mude a porta no .env
```env
PORT=3001
```

---

## 🏁 Verificar se está Funcionando

```bash
# Health check
curl http://localhost:3000/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T..."
}
```

---

## � Deploy (Produção)

### Opções de Deploy:
- **Railway** - MySQL grátis
- **PlanetScale** - MySQL serverless
- **Heroku** - Com ClearDB MySQL addon
- **AWS RDS** - MySQL gerenciado
- **Digital Ocean** - MySQL droplet

### Configurar para Produção:
1. Atualize DATABASE_URL com credentials do servidor
2. Execute migrations: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Start: `npm start`

