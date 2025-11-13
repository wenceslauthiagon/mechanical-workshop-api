# Guia de Testes - Fase 2

## 🎯 Objetivo

Validar localmente todos os componentes da Fase 2 antes do deploy em produção.

## 📋 Pré-requisitos

```bash
# Verificar instalações
docker --version          # Docker 20+
docker-compose --version  # 2.0+
kubectl version --client  # 1.28+
terraform version         # 1.6+
node --version           # 20+
```

## 1️⃣ Teste Docker Local

### 1.1 Build da Imagem

```bash
# Build otimizado
docker build -t mechanical-workshop-api:test .

# Verificar tamanho (deve ser < 300MB)
docker images | grep mechanical-workshop-api

# Inspecionar camadas
docker history mechanical-workshop-api:test
```

### 1.2 Docker Compose (Desenvolvimento)

```bash
# Subir stack completa
docker-compose -f docker-compose.dev.yml up -d

# Verificar containers
docker-compose -f docker-compose.dev.yml ps

# Logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f api

# Health check
curl http://localhost:3000/health

# Swagger
# Abrir: http://localhost:3000/api

# Parar
docker-compose -f docker-compose.dev.yml down
```

### 1.3 Validar Multi-stage Build

```bash
# Deve ter usuário nestjs (não root)
docker run --rm mechanical-workshop-api:test whoami
# Output esperado: nestjs

# Verificar arquivos
docker run --rm mechanical-workshop-api:test ls -la /app
# Deve ter: dist/, node_modules/
```

## 2️⃣ Teste APIs Fase 2

### 2.1 Setup Inicial

```bash
# Subir ambiente
docker-compose -f docker-compose.dev.yml up -d

# Criar admin
npm run create:admin
# Email: admin@example.com
# Password: Admin@123
```

### 2.2 Autenticação

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }' | jq -r '.accessToken')

echo $TOKEN
```

### 2.3 Endpoint de Prioridade

```bash
# Listar OS com prioridade
curl -X GET "http://localhost:3000/api/service-orders/priority?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq

# Validar:
# - Ordenação correta (EM_EXECUCAO > AGUARDANDO_APROVACAO > EM_DIAGNOSTICO > RECEBIDA)
# - Não contém FINALIZADA ou ENTREGUE
# - Paginação funcional
```

### 2.4 Criar OS para Teste

```bash
# Criar cliente
CUSTOMER_ID=$(curl -s -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "email": "cliente@teste.com",
    "cpf": "12345678901",
    "phone": "11999999999"
  }' | jq -r '.id')

# Criar veículo
VEHICLE_ID=$(curl -s -X POST http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plate": "ABC1234",
    "brand": "Fiat",
    "model": "Uno",
    "year": 2020,
    "customerId": "'$CUSTOMER_ID'"
  }' | jq -r '.id')

# Criar OS
SO_ID=$(curl -s -X POST http://localhost:3000/api/service-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "'$VEHICLE_ID'",
    "description": "Revisão completa",
    "status": "EM_EXECUCAO"
  }' | jq -r '.id')

echo "Service Order ID: $SO_ID"
```

### 2.5 Testar Notificação Email

```bash
# Atualizar status (deve enviar email)
curl -X PATCH http://localhost:3000/api/service-orders/$SO_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "FINALIZADA"
  }'

# Verificar logs do email service
docker-compose -f docker-compose.dev.yml logs api | grep "Email"
```

### 2.6 Endpoint Público de Aprovação

```bash
# Criar orçamento
BUDGET_ID=$(curl -s -X POST http://localhost:3000/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceOrderId": "'$SO_ID'",
    "totalValue": 500.00,
    "validUntil": "2025-12-31"
  }' | jq -r '.id')

# Aprovar (endpoint público)
curl -X PUT http://localhost:3000/api/public/budgets/$BUDGET_ID/approve \
  -H "Content-Type: application/json"
```

## 3️⃣ Teste Kubernetes Local

### 3.1 Habilitar Kubernetes no Docker Desktop

```
Docker Desktop → Settings → Kubernetes → Enable Kubernetes
```

### 3.2 Deploy Manual

```bash
# Aplicar manifestos
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml

# Aguardar database subir
kubectl wait --for=condition=ready pod -l app=postgres -n mechanical-workshop --timeout=120s

# Deploy da aplicação
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/hpa.yaml

# Verificar pods
kubectl get pods -n mechanical-workshop -w

# Aguardar ready
kubectl wait --for=condition=ready pod -l app=workshop-api -n mechanical-workshop --timeout=180s
```

### 3.3 Validar Deployments

```bash
# Status geral
kubectl get all -n mechanical-workshop

# Pods em execução
kubectl get pods -n mechanical-workshop
# Deve ter: 3x workshop-api, 1x postgres, 1x redis

# Services
kubectl get svc -n mechanical-workshop

# ConfigMaps e Secrets
kubectl get configmap,secret -n mechanical-workshop

# PVCs
kubectl get pvc -n mechanical-workshop
```

### 3.4 Testar Aplicação

```bash
# Port forward
kubectl port-forward svc/workshop-api-service 8080:80 -n mechanical-workshop

# Em outro terminal
curl http://localhost:8080/health

# Swagger
# Abrir: http://localhost:8080/api
```

### 3.5 Validar Health Checks

```bash
# Ver eventos de liveness/readiness
kubectl describe pod -l app=workshop-api -n mechanical-workshop | grep -A 10 "Liveness\|Readiness"

# Logs
kubectl logs -f deployment/workshop-api -n mechanical-workshop
```

### 3.6 Testar Auto-scaling (HPA)

```bash
# Verificar HPA
kubectl get hpa -n mechanical-workshop
# Deve mostrar: TARGET, MINPODS=3, MAXPODS=10

# Instalar metrics-server (se necessário)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Para Docker Desktop, patch necessário:
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Verificar métricas
kubectl top pods -n mechanical-workshop
kubectl top nodes
```

### 3.7 Simular Carga

```bash
# Instalar hey (Windows)
# Baixar de: https://github.com/rakyll/hey/releases

# Gerar carga constante
hey -z 5m -c 50 -q 10 http://localhost:8080/api/service-orders/priority

# Em outro terminal, observar scaling
watch -n 2 "kubectl get hpa,pods -n mechanical-workshop"

# Deve escalar de 3 para ~8 pods em 2-3 minutos
```

### 3.8 Testar Rolling Update

```bash
# Atualizar imagem
kubectl set image deployment/workshop-api workshop-api=mechanical-workshop-api:v2 -n mechanical-workshop

# Observar rollout
kubectl rollout status deployment/workshop-api -n mechanical-workshop

# Verificar zero downtime
while true; do curl -s http://localhost:8080/health && sleep 0.5; done
```

### 3.9 Cleanup

```bash
# Deletar tudo
kubectl delete namespace mechanical-workshop

# Ou individual
kubectl delete -f k8s/
```

## 4️⃣ Teste Terraform Local

### 4.1 Setup

```bash
cd infra

# Copiar variáveis
cp terraform.tfvars.example terraform.tfvars

# Editar valores
notepad terraform.tfvars
```

### 4.2 Terraform Plan

```bash
# Inicializar
terraform init

# Validar sintaxe
terraform validate

# Ver plano
terraform plan

# Deve mostrar:
# - kubernetes_namespace
# - kubernetes_config_map
# - kubernetes_secret
# - kubernetes_deployment (3x)
# - kubernetes_service (3x)
# - kubernetes_persistent_volume_claim (2x)
# - kubernetes_horizontal_pod_autoscaler
```

### 4.3 Terraform Apply

```bash
# Aplicar
terraform apply -auto-approve

# Verificar outputs
terraform output

# Testar API
kubectl port-forward svc/workshop-api-service 8080:80 -n mechanical-workshop
curl http://localhost:8080/health
```

### 4.4 Terraform State

```bash
# Listar recursos
terraform state list

# Ver detalhes
terraform state show kubernetes_deployment.workshop_api

# Refresh state
terraform refresh
```

### 4.5 Modificações

```bash
# Editar variável
nano terraform.tfvars
# Exemplo: replicas = 5

# Aplicar mudança
terraform apply

# Verificar
kubectl get pods -n mechanical-workshop
# Deve ter 5 réplicas
```

### 4.6 Destroy

```bash
# Preview
terraform plan -destroy

# Destruir
terraform destroy -auto-approve

# Verificar
kubectl get all -n mechanical-workshop
# Deve retornar: No resources found
```

## 5️⃣ Teste CI/CD (Simulação Local)

### 5.1 Simular Lint e Test

```bash
# Instalar dependências
npm ci

# Lint
npm run lint

# Testes unitários
npm run test

# Coverage
npm run test:cov
# Abrir: coverage/lcov-report/index.html

# E2E com containers
docker-compose -f docker-compose.dev.yml up -d postgres redis
npm run test:e2e
```

### 5.2 Simular Docker Build

```bash
# Build local
docker build -t ghcr.io/creative-ia/mechanical-workshop-api:test .

# Tag adicional
docker tag ghcr.io/creative-ia/mechanical-workshop-api:test ghcr.io/creative-ia/mechanical-workshop-api:latest

# Push (requer login no GHCR)
# docker login ghcr.io -u USERNAME
# docker push ghcr.io/creative-ia/mechanical-workshop-api:test
```

### 5.3 Simular Deploy K8s

```bash
# Atualizar imagem no deployment
kubectl set image deployment/workshop-api \
  workshop-api=ghcr.io/creative-ia/mechanical-workshop-api:test \
  -n mechanical-workshop

# Verificar rollout
kubectl rollout status deployment/workshop-api -n mechanical-workshop
kubectl rollout history deployment/workshop-api -n mechanical-workshop
```

### 5.4 Testar GitHub Actions Localmente (act)

```bash
# Instalar act (Windows)
# https://github.com/nektos/act

# Simular workflow
act -l  # Listar jobs

act push  # Simular push

# Com secrets
act push --secret-file .secrets
```

## 6️⃣ Testes de Integração

### 6.1 Fluxo Completo

```bash
# 1. Deploy com Terraform
cd infra && terraform apply -auto-approve && cd ..

# 2. Aguardar pods ready
kubectl wait --for=condition=ready pod -l app=workshop-api -n mechanical-workshop --timeout=300s

# 3. Port forward
kubectl port-forward svc/workshop-api-service 8080:80 -n mechanical-workshop &

# 4. Health check
curl http://localhost:8080/health

# 5. Criar dados de teste
./scripts/seed-test-data.sh

# 6. Testar prioridade
curl http://localhost:8080/api/service-orders/priority | jq

# 7. Gerar carga
hey -z 2m -c 20 http://localhost:8080/api/service-orders/priority

# 8. Verificar scaling
kubectl get hpa -n mechanical-workshop

# 9. Cleanup
terraform destroy -auto-approve
```

## 7️⃣ Checklist Final

### ✅ Docker
- [ ] Build multi-stage funcional
- [ ] Imagem < 300MB
- [ ] Container roda como non-root
- [ ] Docker compose sobe stack completa
- [ ] Health check responde

### ✅ APIs
- [ ] Endpoint de prioridade ordena corretamente
- [ ] Notificação de email funcional
- [ ] Endpoint público de aprovação acessível
- [ ] Paginação funciona
- [ ] Autenticação protege rotas privadas

### ✅ Kubernetes
- [ ] Namespace criado
- [ ] ConfigMap e Secret aplicados
- [ ] PostgreSQL e Redis com PVCs
- [ ] 3 réplicas da API sobem
- [ ] Services acessíveis
- [ ] Health checks passam
- [ ] HPA configurado (3-10 pods)
- [ ] Métricas disponíveis

### ✅ Auto-scaling
- [ ] HPA detecta métricas
- [ ] Escala para cima sob carga
- [ ] Escala para baixo após carga
- [ ] Permanece no range 3-10

### ✅ Terraform
- [ ] terraform validate passa
- [ ] terraform plan mostra recursos corretos
- [ ] terraform apply cria infra
- [ ] Outputs exibidos corretamente
- [ ] terraform destroy limpa tudo

### ✅ CI/CD
- [ ] Testes passam localmente
- [ ] Linter sem erros
- [ ] Coverage > 80%
- [ ] Build Docker funciona
- [ ] Deploy K8s atualiza imagem

## 8️⃣ Troubleshooting

### Pods em CrashLoopBackOff

```bash
kubectl logs <pod-name> -n mechanical-workshop --previous
kubectl describe pod <pod-name> -n mechanical-workshop
```

### HPA não escalona

```bash
# Verificar metrics-server
kubectl get apiservice v1beta1.metrics.k8s.io

# Patch para Docker Desktop
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

### Terraform state locked

```bash
terraform force-unlock <LOCK_ID>
```

### Port-forward não funciona

```bash
# Verificar service
kubectl get svc -n mechanical-workshop

# Listar pods
kubectl get pods -n mechanical-workshop

# Forward direto para pod
kubectl port-forward pod/<pod-name> 8080:3000 -n mechanical-workshop
```

## 9️⃣ Métricas de Sucesso

- ✅ Build Docker < 300MB
- ✅ API responde < 100ms (sem carga)
- ✅ HPA escala em < 3 minutos
- ✅ Rolling update sem downtime
- ✅ Coverage de testes > 80%
- ✅ Terraform apply < 5 minutos
- ✅ 3 réplicas rodando por padrão
- ✅ Escala até 10 pods sob carga

## ⚠️ Avisos Importantes

- **Docker Desktop K8s**: Recursos limitados, ajuste replicas se necessário
- **Metrics-server**: Requer patch no Docker Desktop
- **PVCs**: Usar hostPath em ambiente local
- **LoadBalancer**: Usa localhost no Docker Desktop
- **Secrets**: NUNCA comitar arquivo terraform.tfvars

## 📚 Próximos Passos

1. Testar localmente seguindo este guia
2. Gravar vídeo demonstrativo
3. Fazer push das mudanças
4. Aguardar CI/CD executar
5. Validar deploy em produção
