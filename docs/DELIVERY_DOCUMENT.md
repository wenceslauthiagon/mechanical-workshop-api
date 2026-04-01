# Documento de Entrega — Tech Challenge
## Sistema de Gestão de Oficina Mecânica

---

## Integrantes

| Nome Completo | RM | Contato |
|---|---|---|
| Thiago Camilo Nonato Wenceslau | rm369061 | (11) 98911-9768 |

---

## 1. Repositórios GitHub Entregues

### 1.1. Aplicação Principal (API)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-api
- Stack: NestJS + TypeScript + Prisma
- Principais pontos:
  - Arquitetura em camadas (Clean Architecture + DDD)
  - Gestão de clientes, veículos, serviços, peças e ordens de serviço
  - Testes automatizados (unitários e integração)
  - Pipelines CI/CD para `develop` e `main`

### 1.2. Function Serverless (Autenticação CPF)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-auth-function
- Objetivo: autenticação via CPF com emissão de JWT
- Principais pontos:
  - Azure Function (Node/TypeScript)
  - Validação de CPF com algoritmo de dígitos verificadores
  - Integração com banco de dados e geração de token JWT

### 1.3. Infraestrutura Kubernetes (Terraform)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra
- Objetivo: provisionamento e configuração de infraestrutura K8s
- Principais pontos:
  - Terraform para ambiente Kubernetes
  - Estrutura de CI/CD para validação e plano

### 1.4. Infraestrutura de Banco de Dados (Terraform)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-database-infra
- Objetivo: provisionamento da infraestrutura de banco
- Principais pontos:
  - Terraform para recursos de banco gerenciado
  - Validação e automação por pipeline

---

## 2. Requisitos Atendidos no Desafio

- ✅ API Gateway com Kong
- ✅ Arquitetura com 4 repositórios separados
- ✅ CI/CD com GitHub Actions
- ✅ Infraestrutura como código com Terraform
- ✅ Orquestração com Kubernetes
- ✅ Documentação arquitetural (diagramas, ADRs e RFCs)
- ✅ Observabilidade e monitoramento documentados

---

## 3. Evidências de CI/CD

### Status das pipelines
- Branch `develop`: ✅ execução concluída com sucesso
- Branch `main`: ✅ execução concluída com sucesso

### Etapas executadas
- Lint e testes
- Build e push de imagem Docker
- Deploy Staging e Production em modo sem custo
- Etapas de Terraform conforme workflow

> **Observação:** para evitar custos em nuvem, os deploys foram configurados em modo de simulação, mantendo a esteira completa para validação acadêmica.

---

## 4. Documentação Técnica

Documentação principal:  
https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/docs

### Links principais
- Diagrama de Componentes: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/COMPONENT_DIAGRAM.md
- Diagrama de Sequência: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/SEQUENCE_DIAGRAM.md
- Diagrama ER: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ER-DIAGRAM.md
- ADR API Gateway (Kong): https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-001-API-GATEWAY-KONG.md
- ADR Banco PostgreSQL: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-002-POSTGRESQL-DATABASE.md
- RFC Plataforma Cloud: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/RFC-001-CLOUD-PLATFORM.md
- RFC Estratégia de Autenticação: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/RFC-002-AUTHENTICATION-STRATEGY.md

---

## 5. Vídeo de Demonstração

**Plataforma:** YouTube (não listado)  
**Link:** [PREENCHER]  
**Duração:** [PREENCHER]

### Conteúdo apresentado
- Visão dos 4 repositórios
- Execução da pipeline em `develop`
- Execução da pipeline em `main`
- Documentação arquitetural

---

## 6. Como Testar a Função de Validação de CPF

A autenticação via CPF é implementada como uma **Azure Function** independente, localizada no repositório da Function Serverless.

### Pré-requisitos
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) instalado
- Node.js 18+
- Banco de dados com pelo menos um cliente cadastrado (tipo `PESSOA_FISICA`) com CPF

### Configuração

```bash
# 1. Clone o repositório da function
git clone https://github.com/wenceslauthiagon/mechanical-workshop-auth-function
cd mechanical-workshop-auth-function

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp local.settings.example.json local.settings.json
```

Edite o `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "DATABASE_URL": "file:../mechanical-workshop-api/prisma/dev.db",
    "JWT_SECRET": "your-secret-key",
    "JWT_EXPIRATION": "24h"
  }
}
```

### Iniciar a Function

```bash
npm start
# Function disponível em: http://localhost:7071
```

### Testar via cURL

```bash
# CPF inválido (formato incorreto)
curl -X POST http://localhost:7071/api/auth \
  -H "Content-Type: application/json" \
  -d '{"cpf": "00000000000"}'
# Resposta: 400 Bad Request — CPF inválido

# CPF válido mas cliente não cadastrado
curl -X POST http://localhost:7071/api/auth \
  -H "Content-Type: application/json" \
  -d '{"cpf": "52998224725"}'
# Resposta: 404 Not Found — Cliente não encontrado

# CPF válido com cliente cadastrado
curl -X POST http://localhost:7071/api/auth \
  -H "Content-Type: application/json" \
  -d '{"cpf": "SEU_CPF_CADASTRADO"}'
# Resposta: 200 OK — { "token": "eyJhbGci..." }
```

### Testar via Postman / Insomnia

| Campo | Valor |
|---|---|
| Método | `POST` |
| URL | `http://localhost:7071/api/auth` |
| Body (JSON) | `{ "cpf": "52998224725" }` |

### Usar o JWT retornado na API Principal

```bash
# Copie o token retornado e use no header Authorization da API principal
curl -X GET http://localhost:3000/api/customers \
  -H "Authorization: Bearer eyJhbGci..."
```

### CPF para testes (gerador online)
Use o gerador em https://www.4devs.com.br/gerador_de_cpf para criar CPFs válidos e cadastre um cliente com esse CPF na API principal antes de testar.

---

## 7. Colaborador Obrigatório

Usuário solicitado: **`soat-architecture`**

| Repositório | Status |
|---|---|
| mechanical-workshop-auth-function | [X] Adicionado — https://github.com/wenceslauthiagon/mechanical-workshop-auth-function |
| mechanical-workshop-kubernetes-infra | [X] Adicionado — https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra |
| mechanical-workshop-database-infra | [X] Adicionado — https://github.com/wenceslauthiagon/mechanical-workshop-database-infra |
| mechanical-workshop-api | [X] Adicionado — https://github.com/wenceslauthiagon/mechanical-workshop-api |

---

## 8. Checklist Final de Entrega

- [X] Campos pendentes preenchidos
- [ ] Link do vídeo preenchido
- [X] Evidências de pipeline validadas
- [X] `soat-architecture` confirmado nos 4 repositórios
- [ ] PDF gerado e enviado no Portal do Aluno

---

## 9. Como Exportar para PDF

### Opção rápida (VS Code)
1. Abrir este arquivo no VS Code.
2. Usar extensão **Markdown PDF**.
3. Executar: `Markdown PDF: Export (pdf)`.

### Opção via Pandoc

```bash
pandoc docs/DELIVERY_DOCUMENT.md -o TECH_CHALLENGE_ENTREGA.pdf --pdf-engine=xelatex
```

---

**Data:** 31/03/2026
