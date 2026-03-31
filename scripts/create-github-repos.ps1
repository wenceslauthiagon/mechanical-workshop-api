# Script para criar os 4 repositórios no GitHub
# Requisito: GitHub CLI instalada (gh)

$repos = @(
    "mechanical-workshop-auth-function",
    "mechanical-workshop-kubernetes-infra",
    "mechanical-workshop-database-infra",
    "mechanical-workshop-api"
)

foreach ($repo in $repos) {
    Write-Host "Criando repositório: $repo" -ForegroundColor Green
    gh repo create $repo --public --description "Tech Challenge - FIAP"
}

Write-Host "`nRepositórios criados com sucesso!" -ForegroundColor Green
Write-Host "Adicione o colaborador soat-architecture em cada repo no GitHub UI"
