# Mechanical Workshop API - Makefile
# Comandos úteis para desenvolvimento e deploy

.PHONY: help build up down logs clean restart test dev prod

# Cores para output
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Mostrar ajuda com comandos disponíveis
	@echo "${BLUE}Mechanical Workshop API - Comandos Disponíveis:${NC}"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${GREEN}%-20s${NC} %s\n", $$1, $$2}'

build: ## Construir imagens Docker
	@echo "${BLUE}Construindo imagens Docker...${NC}"
	docker-compose build --no-cache

up: ## Iniciar todos os serviços
	@echo "${BLUE}Iniciando serviços...${NC}"
	docker-compose up -d
	@echo "${GREEN}Serviços iniciados! API disponível em http://localhost:3000${NC}"

down: ## Parar todos os serviços
	@echo "${BLUE}Parando serviços...${NC}"
	docker-compose down

logs: ## Ver logs de todos os serviços
	@echo "${BLUE}Logs dos serviços:${NC}"
	docker-compose logs -f

logs-app: ## Ver logs apenas da aplicação
	@echo "${BLUE}Logs da aplicação:${NC}"
	docker-compose logs -f app

logs-db: ## Ver logs apenas do banco
	@echo "${BLUE}Logs do banco de dados:${NC}"
	docker-compose logs -f postgres

clean: ## Limpar containers, volumes e imagens
	@echo "${YELLOW}Limpando recursos Docker...${NC}"
	docker-compose down -v --remove-orphans
	docker system prune -f

restart: down up ## Reiniciar todos os serviços

dev: ## Ambiente de desenvolvimento
	@echo "${BLUE}Iniciando ambiente de desenvolvimento...${NC}"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

prod: build up ## Deploy em produção
	@echo "${BLUE}Deploy em produção...${NC}"

test: ## Executar testes
	@echo "${BLUE}Executando testes...${NC}"
	docker-compose exec app npm run test

test-cov: ## Executar testes com coverage
	@echo "${BLUE}Executando testes com coverage...${NC}"
	docker-compose exec app npm run test:cov

migration: ## Executar migrações do banco
	@echo "${BLUE}Executando migrações...${NC}"
	docker-compose exec app npx prisma migrate deploy

seed: ## Popular banco com dados iniciais
	@echo "${BLUE}Populando banco de dados...${NC}"
	docker-compose exec app node scripts/create-admin.js

shell-app: ## Acessar shell do container da aplicação
	@echo "${BLUE}Acessando shell da aplicação...${NC}"
	docker-compose exec app sh

shell-db: ## Acessar shell do banco de dados
	@echo "${BLUE}Acessando PostgreSQL...${NC}"
	docker-compose exec postgres psql -U postgres -d mechanical_workshop

health: ## Verificar saúde dos serviços
	@echo "${BLUE}Verificando saúde dos serviços...${NC}"
	@curl -f http://localhost:3000/health && echo "${GREEN}API saudável${NC}" || echo "${RED}API com problemas${NC}"

status: ## Ver status dos containers
	@echo "${BLUE}Status dos containers:${NC}"
	docker-compose ps

backup-db: ## Fazer backup do banco de dados
	@echo "${BLUE}Fazendo backup do banco...${NC}"
	docker-compose exec postgres pg_dump -U postgres mechanical_workshop > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}Backup criado!${NC}"

setup: build up migration seed ## Setup completo do projeto
	@echo "${GREEN}Setup completo finalizado!${NC}"
	@echo "${BLUE}Próximos passos:${NC}"
	@echo "   - API: http://localhost:3000"
	@echo "   - Swagger: http://localhost:3000/api"
	@echo "   - Health: http://localhost:3000/health"