Documento de Entrega — Tech Challenge
Sistema de Gestao de Oficina Mecanica

Integrantes
Nome Completo RM Contato
Thiago Camilo Nonato Wenceslau rm369061 (11) 98911-9768

1. Repositorios GitHub Entregues
1.1 Aplicacao Principal (API)
URL: https://github.com/wenceslauthiagon/mechanical-workshop-api

1.2 Function Serverless
URL: https://github.com/wenceslauthiagon/mechanical-workshop-auth-function

1.3 Infraestrutura Kubernetes (Terraform)
URL: https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra

1.4 Infraestrutura de Banco de Dados (Terraform)
URL: https://github.com/wenceslauthiagon/mechanical-workshop-database-infra

2. Requisitos Atendidos no Desafio
API Gateway com Kong
Arquitetura com 4 repositorios separados
CI/CD com GitHub Actions
Infraestrutura como codigo com Terraform
Orquestracao com Kubernetes
Documentacao arquitetural (diagramas, ADRs e RFCs)
Observabilidade e monitoramento documentados

3. Como Testar a Funcao de Validacao de CPF
A autenticacao via CPF e implementada como uma Azure Function independente.
Repositorio: https://github.com/wenceslauthiagon/mechanical-workshop-auth-function

Pre-requisitos
- Azure Functions Core Tools v4 instalado
- Node.js 18+
- API principal rodando com pelo menos um cliente do tipo PESSOA_FISICA cadastrado com CPF no campo document

Passo a passo
3.1 Instalar o Azure Functions Core Tools (se necessario):
npm install -g azure-functions-core-tools@4 --unsafe-perm true

3.2 Clonar e instalar dependencias:
git clone https://github.com/wenceslauthiagon/mechanical-workshop-auth-function
cd mechanical-workshop-auth-function
npm install

3.3 Configurar variaveis de ambiente:
cp local.settings.example.json local.settings.json

Editar o local.settings.json:
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

3.4 Iniciar a Function:
npm start
Function disponivel em: http://localhost:7071

Exemplos de requisicao
Cenario | CPF | Resposta esperada
CPF com digitos invalidos | 00000000000 | 400 Bad Request
CPF valido, cliente nao cadastrado | 52998224725 | 404 Not Found
CPF valido, cliente cadastrado | CPF do cliente | 200 OK com { token: "..." }

Testar via curl
curl -X POST http://localhost:7071/api/auth
-H "Content-Type: application/json"
-d '{"cpf": "SEU_CPF_CADASTRADO"}'

Usar o JWT retornado na API principal
Apos obter o token, utilize-o no header Authorization da API principal:
Authorization: Bearer eyJhbGci...

Para gerar CPFs validos para teste: https://www.4devs.com.br/gerador_de_cpf
Cadastre o cliente via POST /api/customers no Swagger em http://localhost:3000/api

4. Evidencias de CI/CD
Branch develop: execucao concluida com sucesso
Branch main: execucao concluida com sucesso

Etapas executadas:
Lint e testes
Build e push de imagem
Deploy Staging e Production em modo sem custo
Etapas de Terraform conforme workflow

Observacao: para evitar custos em nuvem, os deploys foram configurados em modo de simulacao, mantendo a esteira completa para validacao academica.

5. Evidencias de Execucao Pratica (centralizadas neste documento)
5.1 API principal em execucao local
Comando executado:
curl.exe -s -o NUL -w "LOCAL_API_CODE=%{http_code}\n" http://127.0.0.1:3000/api
Resultado:
LOCAL_API_CODE=200
Evidencia: API local acessivel e respondendo HTTP 200.

5.2 API Gateway (Kong) e rotas
Comando executado (teste in-cluster):
kubectl run kong-final-check --rm -i --restart=Never -n mechanical-workshop --image=curlimages/curl:8.10.1 --command -- sh -c "curl -sS -o /dev/null -w 'HEALTH=%{http_code}\n' http://kong-proxy/health; curl -sS -o /dev/null -w 'PROTECTED=%{http_code}\n' http://kong-proxy/api/customers"
Resultado:
HEALTH=200
PROTECTED=401
Evidencia: rota publica de health funcional e rota protegida exigindo autenticacao.

5.3 Datadog Agent em execucao
Comando executado:
kubectl get pods -n mechanical-workshop -l app=datadog-agent -o wide
Resultado observado:
datadog-agent-qg5nj 1/1 Running
Evidencia: Datadog Agent implantado e ativo no cluster.

5.4 Status operacional do Datadog
Comando executado:
kubectl exec -n mechanical-workshop datadog-agent-qg5nj -- agent status
Resultado (resumo):
Agent (v7.78.0)
cluster-name: mechanical-workshop-prod
hostname: workshop-control-plane
feature_apm_enabled: true
feature_logs_enabled: true
Running Checks: cpu [OK], disk [OK], uptime [OK]
Evidencia: coleta local em execucao.

5.5 Logs do Datadog e diagnostico
Comando executado:
kubectl logs -n mechanical-workshop daemonset/datadog-agent --tail=120 | Select-String -Pattern "No data received|trace|API Key invalid|403|check:kubelet"
Resultado observado:
API Key invalid (403 response)
TRACE | No data received
check:kubelet temporary failure
Evidencia: integracao Datadog configurada e rodando localmente; envio cloud pendente por credencial (API key invalida/ausente).

5.6 Infraestrutura Kubernetes local
Evidencias de comandos:
kubectl get pods -n mechanical-workshop
kubectl get svc -n mechanical-workshop
kubectl get hpa -n mechanical-workshop
Resultado consolidado: workloads principais em Running no namespace mechanical-workshop.

6. Documentacao Tecnica
Documentacao principal:
https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/docs

Links principais:
Diagrama de Componentes: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/COMPONENT_DIAGRAM.md
Diagrama de Sequencia: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/SEQUENCE_DIAGRAM.md
Diagrama ER: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ER-DIAGRAM.md
ADR API Gateway (Kong): https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-001-API-GATEWAY-KONG.md
ADR Banco PostgreSQL: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-002-POSTGRESQL-DATABASE.md
RFC Plataforma Cloud: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/RFC-001-CLOUD-PLATFORM.md
RFC Estrategia de Autenticacao: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/RFC-002-AUTHENTICATION-STRATEGY.md

7. Conteudo apresentado:
Visao dos 4 repositorios
Execucao da pipeline em develop
Execucao da pipeline em main
Documentacao arquitetural
Execucao local da API e Function CPF
Evidencias de Kong e Datadog no terminal

8. Colaborador Obrigatorio
Usuario solicitado: soat-architecture
Repositorio | Status
mechanical-workshop-auth-function | [X] Adicionado https://github.com/wenceslauthiagon/mechanical-workshop-auth-function
mechanical-workshop-kubernetes-infra | [X] Adicionado https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra
mechanical-workshop-database-infra | [X] Adicionado https://github.com/wenceslauthiagon/mechanical-workshop-database-infra
mechanical-workshop-api | [X] Adicionado https://github.com/wenceslauthiagon/mechanical-workshop-api

9. Checklist Final de Entrega
[X] Campos pendentes preenchidos (exceto link/duracao do video)
[X] Evidencias de pipeline validadas
[X] soat-architecture confirmado nos 4 repositorios
[ ] PDF gerado e enviado no Portal do Aluno
