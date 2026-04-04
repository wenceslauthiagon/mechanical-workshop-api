# RFC 002 - Estratégia de Autenticação Serverless via CPF

**Status**: Aprovado  
**Data**: 2024-03-15  
**Autor**: Equipe de Segurança e Backend  
**Revisores**: Arquiteto de Soluções, CISO

## Contexto

O sistema de oficina mecânica precisa de um mecanismo de autenticação simples e seguro para clientes acessarem suas ordens de serviço. O requisito é:

- Autenticação via CPF (sem senha)
- Geração de JWT token
- Isolamento da lógica de autenticação
- Escalabilidade automática
- Baixo custo operacional

## Problema

Como implementar autenticação segura via CPF sem comprometer a segurança e mantendo custos baixos?

## Opções Consideradas

### Opção 1: Endpoint na API Principal (NestJS)

**Implementação:**
```typescript
@Post('/auth')
async authenticate(@Body() { cpf }: AuthDto) {
  // Validar CPF
  // Consultar banco
  // Gerar JWT
  return { token, customer };
}
```

**Prós:**
- Simples de implementar
- Sem custo adicional de infra
- Mesmo código base
- Fácil de debugar

**Contras:**
- Consome recursos do pod principal
- Difícil de escalar independentemente
- Aumenta superfície de ataque
- Não atende requisito de "serverless"

**Custo**: $0 adicional

### Opção 2: Azure Function Serverless

**Implementação:**
```typescript
export default async function (req: HttpRequest, context: Context) {
  const { cpf } = req.body;
  // Validar CPF
  // Consultar banco
  // Gerar JWT
  return { token, customer };
}
```

**Prós:**
- Escalabilidade automática
- Pay-per-use (muito barato)
- Isolamento completo
- Cold start aceitável (~200ms)
- Atende requisito de serverless
- Facilita rate limiting específico

**Contras:**
- Complexidade adicional (mais um componente)
- Latência de cold start
- Requer deploy separado

**Custo**: ~$0.20/mês (1M execuções)

### Opção 3: Azure AD B2C

**Implementação:**
- Configurar Azure AD B2C
- Custom policy para CPF
- Integração via OAuth2/OIDC

**Prós:**
- Solução enterprise
- MFA nativo
- Gestão de identidade completa
- Auditoria integrada

**Contras:**
- Overkill para o caso de uso
- Complexo de configurar
- Custo alto
- Menos flexível

**Custo**: ~$150/mês

### Opção 4: Auth0 / Cognito

**Implementação:**
- Configurar Auth0/Cognito
- Custom flow para CPF
- Webhooks para validação

**Prós:**
- Solução gerenciada
- Features prontas (MFA, social login)
- Boa documentação

**Contras:**
- Vendor lock-in adicional
- Custo elevado
- Complexidade desnecessária para CPF simples

**Custo**: ~$100/mês

## Decisão

**Escolhemos: Azure Function Serverless (Opção 2)**

### Justificativas

1. **Custo-Benefício Excelente**
   - $0.20/mês para 1 milhão de execuções
   - Estimativa: 100k auths/mês = $0.02/mês
   - ROI: infinito comparado com alternativas

2. **Escalabilidade Automática**
   - Escala de 0 a N instâncias automaticamente
   - Sem preocupação com dimensionamento
   - Ideal para picos de uso (ex: promoções)

3. **Isolamento de Segurança**
   - Lógica de autenticação isolada
   - Se comprometida, não afeta API principal
   - Logs e auditoria separados
   - Possibilidade de rate limiting específico

4. **Atende Requisito Técnico**
   - Requisito explícito: "Function Serverless"
   - Azure Functions v4 maduro e estável
   - TypeScript suportado nativamente

5. **Performance Aceitável**
   - Cold start: ~200ms (aceitável para autenticação)
   - Warm execution: ~50ms
   - Cache de conexões do Prisma

6. **Simplicidade Operacional**
   - Managed service (sem infraestrutura)
   - Auto-updates do runtime
   - HA nativo

7. **Facilita Compliance**
   - Logs isolados
   - Auditoria de acessos
   - LGPD: controle de dados sensíveis (CPF)

## Arquitetura da Solução

```
┌─────────┐     ┌──────────────┐     ┌───────────────┐     ┌────────────┐
│ Cliente │────▶│ API Gateway  │────▶│ Azure Function│────▶│ PostgreSQL │
│  (App)  │     │   (Kong)     │     │   (CPF Auth)  │     │  Managed   │
└─────────┘     └──────────────┘     └───────────────┘     └────────────┘
                      │                      │
                      │                      ▼
                      │              ┌──────────────┐
                      │              │ Generate JWT │
                      │              │   HS256      │
                      │              └──────────────┘
                      ▼
              ┌──────────────┐
              │  Datadog     │
              │  Monitoring  │
              └──────────────┘
```

### Fluxo Detalhado

1. **Cliente** envia POST /auth com CPF
2. **Kong Gateway**:
   - Aplica rate limiting (10 req/min por IP)
   - Adiciona X-Correlation-ID
   - Roteia para Azure Function
3. **Azure Function**:
   - Valida formato do CPF (algoritmo completo)
   - Consulta PostgreSQL (via Prisma)
   - Verifica tipo de cliente (PESSOA_FISICA)
   - Gera JWT (HS256, exp: 24h)
   - Retorna token + dados do cliente
4. **Kong Gateway**:
   - Registra métricas no Datadog
   - Retorna resposta ao cliente
5. **Cliente** usa token em requisições futuras

## Implementação

### Azure Function Code

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function httpTrigger(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await req.json();
    const { cpf } = body;

    // 1. Validar CPF
    if (!isValidCPF(cpf)) {
      return { status: 400, jsonBody: { message: "CPF inválido" } };
    }

    // 2. Consultar cliente
    const customer = await prisma.customer.findUnique({
      where: { document: cpf.replace(/\D/g, "") }
    });

    if (!customer) {
      return { status: 404, jsonBody: { message: "Cliente não encontrado" } };
    }

    // 3. Verificar tipo
    if (customer.type !== "PESSOA_FISICA") {
      return { status: 400, jsonBody: { message: "Apenas pessoa física" } };
    }

    // 4. Gerar JWT
    const token = jwt.sign(
      { customerId: customer.id, document: customer.document },
      process.env.JWT_SECRET,
      { expiresIn: "24h", issuer: "mechanical-workshop-auth" }
    );

    return {
      status: 200,
      jsonBody: { token, customer: { id: customer.id, name: customer.name } }
    };
  } catch (error) {
    context.error("Auth error:", error);
    return { status: 500, jsonBody: { message: "Erro interno" } };
  }
}

app.http("auth", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: httpTrigger,
});
```

### Validação de CPF

```typescript
function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  
  if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) {
    return false;
  }

  // Validar dígito 1
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  digit1 = digit1 > 9 ? 0 : digit1;

  if (digit1 !== parseInt(clean[9])) return false;

  // Validar dígito 2
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  digit2 = digit2 > 9 ? 0 : digit2;

  return digit2 === parseInt(clean[10]);
}
```

## Segurança

### 1. Rate Limiting (Kong Gateway)
```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 10  # Max 10 tentativas por minuto por IP
      hour: 100   # Max 100 por hora
```

### 2. JWT Configuration
- **Algorithm**: HS256 (simétrico, performático)
- **Expiration**: 24 horas
- **Secret**: Rotacionado mensalmente
- **Claims**: customerId, document, name, email

### 3. Database Security
- Connection string em Azure Key Vault
- SSL/TLS obrigatório
- Prepared statements (Prisma)
- Read-only permission na tabela customers

### 4. LGPD Compliance
- CPF hashado em logs
- Auditoria de acessos
- Retenção de logs: 90 dias
- Direito de esquecimento implementado

## Monitoramento

### Métricas Coletadas
```typescript
// Datadog custom metrics
dogstatsd.increment('auth.attempts', 1, ['status:success']);
dogstatsd.timing('auth.duration_ms', duration);
dogstatsd.increment('auth.cpf_invalid', 1);
dogstatsd.increment('auth.customer_not_found', 1);
```

### Alertas Configurados
- Taxa de erro > 5% em 5 minutos → P1
- Latência p95 > 1s em 10 minutos → P2
- Cold starts frequentes (>50/hora) → P3
- JWT validation failures > 100/min → P1

## Alternativas Consideradas e Rejeitadas

### Por que não senha?
- Requisito: autenticação via CPF apenas
- Clientes não querem gerenciar senhas
- CPF é documento único e já validado no cadastro
- Simplicidade para usuário final

### Por que não biometria?
- Complexidade de implementação
- Nem todos dispositivos suportam
- CPF é suficiente para nível de segurança requerido
- Possível adição futura como 2FA

### Por que não OTP (SMS)?
- Custo: $0.05 por SMS
- 100k auths/mês = $5,000/mês
- Latência adicional (3-5s)
- Problemas de entrega
- Azure Function custa $0.02/mês (250x mais barato)

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Cold start alto | Média | Baixo | Keep-alive ping a cada 5min |
| Vazamento de JWT_SECRET | Baixa | Alto | Rotação mensal + Azure Key Vault |
| Brute force de CPF | Média | Médio | Rate limiting agressivo |
| Database overload | Baixa | Alto | Connection pooling + cache |

## Métricas de Sucesso

Após 3 meses:
- [ ] Latência p95 < 300ms
- [ ] Taxa de erro < 0.5%
- [ ] Custo < $1/mês
- [ ] Cold start < 30% das requisições
- [ ] Zero incidentes de segurança

## Plano de Rollback

Se Azure Function apresentar problemas:

1. **Plano A** (imediato): Rotear para endpoint na API principal (já implementado como backup)
2. **Plano B** (1 semana): Migrar para AWS Lambda
3. **Plano C** (2 semanas): Implementar Auth0/Cognito

## Próximos Passos

1. ✅ Implementar Azure Function
2. ✅ Configurar CI/CD (GitHub Actions)
3. ✅ Integrar com Kong Gateway
4. ✅ Setup monitoramento Datadog
5. 🔄 Testes de carga (1M requests)
6. 🔄 Documentação de operação
7. 🔄 Treinamento da equipe

## Referências

- [Azure Functions Best Practices](https://learn.microsoft.com/azure/azure-functions/functions-best-practices)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [LGPD - Lei Geral de Proteção de Dados](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Validação de CPF - Receita Federal](https://www.gov.br/receitafederal/pt-br)

---

## Comentários e Aprovações

**Arquiteto de Soluções** ✅ Aprovado - Solução técnica sólida e bem justificada  
**CISO** ✅ Aprovado - Segurança adequada com rate limiting e JWT  
**CTO** ✅ Aprovado - Excelente custo-benefício e atende requisito serverless
