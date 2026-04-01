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

### 1.2. Function Serverless (Autenticação CPF)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-auth-function

### 1.3. Infraestrutura Kubernetes (Terraform)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra

### 1.4. Infraestrutura de Banco de Dados (Terraform)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-database-infra

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

- Branch `develop`: ✅ execução concluída com sucesso
- Branch `main`: ✅ execução concluída com sucesso

### Etapas executadas
- Lint e testes
- Build e push de imagem
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

A autenticação via CPF é implementada como uma **Azure Function** independente.  
Repositório: https://github.com/wenceslauthiagon/mechanical-workshop-auth-function

### Pré-requisitos
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) instalado
- Node.js 18+
- API principal rodando com pelo menos um cliente do tipo `PESSOA_FISICA` cadastrado com CPF no campo `document`

### Passo a passo

**1. Instalar o Azure Functions Core Tools (se necessário):**
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

**2. Clonar e instalar dependências:**
```bash
git clone https://github.com/wenceslauthiagon/mechanical-workshop-auth-function
cd mechanical-workshop-auth-function
npm install
```

**3. Configurar variáveis de ambiente:**
```bash
cp local.settings.example.json local.settings.json
```

Editar o `local.settings.json`:
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

**4. Iniciar a Function:**
```bash
npm start
# Function disponível em: http://localhost:7071
```

### Exemplos de requisição

| Cenário | CPF | Resposta esperada |
|---|---|---|
| CPF com dígitos inválidos | `00000000000` | `400 Bad Request` |
| CPF válido, cliente não cadastrado | `52998224725` | `404 Not Found` |
| CPF válido, cliente cadastrado | CPF do cliente | `200 OK` com `{ token: "..." }` |

```bash
# Testar via curl
curl -X POST http://localhost:7071/api/auth \
  -H "Content-Type: application/json" \
  -d '{"cpf": "SEU_CPF_CADASTRADO"}'
```

### Usar o JWT retornado na API principal

Após obter o token, utilize-o no header `Authorization` da API principal:
```
Authorization: Bearer eyJhbGci...
```

> 💡 Para gerar CPFs válidos para teste: https://www.4devs.com.br/gerador_de_cpf  
> Cadastre o cliente via `POST /api/customers` no Swagger em `http://localhost:3000/api`

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
1. Abrir este arquivo no VS Code
2. Instalar extensão **Markdown PDF**
3. Executar: `Markdown PDF: Export (pdf)`

### Opção via Pandoc
```bash
pandoc docs/DELIVERY_DOCUMENT.md -o TECH_CHALLENGE_ENTREGA.pdf --pdf-engine=xelatex
```

---

**Data:** 31/03/2026
