# RFC 001 - Escolha da Plataforma de Nuvem

**Status**: Aprovado  
**Data**: 2024-03-15  
**Autor**: Equipe de Arquitetura  
**Revisores**: Tech Lead, DevOps Lead

## Contexto

A oficina mecânica precisa expandir suas operações para múltiplas unidades e aumentar significativamente a base de clientes. A infraestrutura atual precisa ser migrada para a nuvem para garantir:

- Escalabilidade horizontal e vertical
- Alta disponibilidade (99.9% SLA)
- Segurança corporativa
- Redução de custos operacionais
- Disaster recovery

## Opções Consideradas

### Opção 1: Amazon Web Services (AWS)
**Prós:**
- Maior marketshare (32% em 2024)
- Serviços maduros e estáveis
- Documentação extensa
- Comunidade grande
- EKS (Kubernetes gerenciado) robusto
- RDS PostgreSQL com Multi-AZ
- Lambda para serverless
- CloudWatch para monitoramento

**Contras:**
- Complexidade da console
- Curva de aprendizado íngreme
- Custos podem escalar rapidamente
- Vendedor lock-in

**Custo Estimado Mensal**: ~$800

### Opção 2: Microsoft Azure
**Prós:**
- Integração nativa com Azure Functions
- AKS (Azure Kubernetes Service)
- Azure Database for PostgreSQL
- Excelente suporte para .NET/TypeScript
- Azure DevOps integrado
- Bons descontos para startups

**Contras:**
- Documentação às vezes inconsistente
- Menos maturidade em alguns serviços
- Interface da console menos intuitiva

**Custo Estimado Mensal**: ~$750

### Opção 3: Google Cloud Platform (GCP)
**Prós:**
- GKE (Google Kubernetes Engine) - melhor Kubernetes gerenciado
- Cloud SQL PostgreSQL performático
- Networking superior
- Preços competitivos
- BigQuery para analytics
- Excelente documentação

**Contras:**
- Menor marketshare (10%)
- Menos serviços que AWS
- Comunidade menor
- Menos vagas de emprego com GCP

**Custo Estimado Mensal**: ~$700

### Opção 4: Multi-Cloud
**Prós:**
- Evita vendor lock-in
- Melhor barganha de preços
- Aproveita melhor de cada plataforma

**Contras:**
- Complexidade operacional alta
- Custos de manutenção aumentados
- Equipe precisa conhecer múltiplas plataformas
- Dificulta troubleshooting

**Custo Estimado Mensal**: ~$1,200

## Decisão

**Escolhemos: Azure (Microsoft Azure)**

### Justificativas

1. **Azure Functions Nativo**
   - Requisito do projeto: Function serverless para autenticação
   - Integração nativa e sem fricção
   - Menor latência entre Function e API

2. **Custo-Benefício**
   - Desconto de $150/mês através do programa de startups
   - Custo final: ~$600/mês
   - Melhor ROI considerando features

3. **Suporte ao TypeScript/Node.js**
   - Stack da aplicação: NestJS + TypeScript
   - Azure tem excelente suporte para Node.js
   - Azure Functions v4 totalmente compatível

4. **AKS (Azure Kubernetes Service)**
   - Kubernetes gerenciado robusto
   - Integração com Azure Monitor
   - Upgrade automático de versões
   - RBAC nativo com Azure AD

5. **Azure Database for PostgreSQL**
   - PostgreSQL 16 disponível
   - HA com zone redundancy
   - Read replicas
   - Backup automático (35 dias retenção)
   - Point-in-time recovery

6. **Monitoramento**
   - Azure Monitor integrado
   - Application Insights para APM
   - Alternativa: Datadog (escolhido por ser melhor)

7. **Networking**
   - Virtual Network com isolamento
   - Private endpoints para database
   - Azure Application Gateway (WAF)
   - Azure DDoS Protection

8. **CI/CD**
   - GitHub Actions (escolha) tem bom suporte para Azure
   - Alternativa: Azure DevOps também disponível

9. **Equipe**
   - Equipe já tem experiência com Azure
   - Certificações Microsoft disponíveis
   - Treinamentos corporativos

## Alternativas Rejeitadas e Por Quê

### AWS
- Rejeitado principalmente pelo custo ($800 vs $600)
- Lambda teria latência ligeiramente maior para nossa API
- Complexidade da console aumentaria tempo de onboarding

### GCP
- Excelente tecnicamente (especialmente GKE)
- Rejeitado por menor comunidade e adoção no mercado
- Menos profissionais com expertise em GCP
- Risco de contratação futura

### Multi-Cloud
- Complexidade operacional não justificada neste momento
- Equipe pequena (5 devs) não conseguiria manter
- Custo maior não compensa benefícios

## Estratégia de Mitigação de Vendor Lock-in

Mesmo escolhendo Azure, vamos minimizar lock-in:

1. **Kubernetes**
   - Usar Kubernetes padrão (não features exclusivas do AKS)
   - Manifestos portáveis para qualquer cloud
   - Helm charts para deploy

2. **Terraform**
   - IaC com Terraform (não ARM templates)
   - Módulos reutilizáveis
   - Providers trocáveis

3. **Containerização**
   - Docker padrão
   - Registry: GHCR (GitHub Container Registry)
   - Imagens portáveis

4. **Database**
   - PostgreSQL padrão (não Azure-specific features)
   - Schema migrations com Prisma
   - Dump/restore padrão

5. **Azure Functions**
   - ÚNICA exceção ao lock-in
   - Código simples, facilmente migrável para Lambda/Cloud Functions
   - Alternativa futura: Container-based serverless

## Métricas de Sucesso

Após 6 meses, avaliaremos:

- [ ] Uptime > 99.9%
- [ ] Custo mensal < $700
- [ ] Tempo de deploy < 10 minutos
- [ ] Latência p95 < 500ms
- [ ] Zero incidentes de segurança

## Plano de Contingência

Se Azure não atender expectativas:

1. **Plano A** (0-3 meses): Otimizar custos e configuração
2. **Plano B** (3-6 meses): Migrar para AWS usando Terraform existente
3. **Plano C** (6+ meses): Considerar multi-cloud para componentes críticos

## Revisão

Este RFC será revisado em **Setembro/2024** (6 meses) para validar a decisão.

## Referências

- [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
- [AWS vs Azure vs GCP Comparison 2024](https://www.cloudflare.com/learning/cloud/aws-vs-azure-vs-gcp/)
- [Gartner Magic Quadrant for Cloud 2024](https://www.gartner.com/en/documents/magic-quadrant)
- [Azure Functions Best Practices](https://learn.microsoft.com/azure/azure-functions/functions-best-practices)

---

## Comentários e Aprovações

**Tech Lead** ✅ Aprovado - Concordo com a escolha técnica e justificativas  
**DevOps Lead** ✅ Aprovado - Azure facilitará operações e tem bom suporte  
**CTO** ✅ Aprovado - Alinhado com estratégia de custos da empresa
