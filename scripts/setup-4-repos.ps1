# Setup dos 4 Repositórios GitHub — Tech Challenge
# 
# Pré-requisitos:
#   - GitHub CLI (gh) instalado: winget install GitHub.cli
#   - Autenticado: gh auth login
#   - Git configurado com seu usuário
#
# Uso:
#   .\scripts\setup-4-repos.ps1 -GitHubOrg "SUA-ORG-OU-USUARIO" -MainRepoPath "."

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubOrg,

    [Parameter(Mandatory=$false)]
    [string]$MainRepoPath = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    [!!] $msg" -ForegroundColor Yellow }

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Tech Challenge — Setup 4 Repositórios" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Verificar pré-requisitos
Write-Step "Verificando pré-requisitos..."
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) não encontrado. Instale com: winget install GitHub.cli"
    exit 1
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git não encontrado."
    exit 1
}
Write-Success "GitHub CLI e Git encontrados."

# Verificar autenticação
gh auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Não autenticado no GitHub CLI. Execute: gh auth login"
    exit 1
}
Write-Success "Autenticado no GitHub CLI."

$TempDir = Join-Path $env:TEMP "mechanical-workshop-repos-$(Get-Random)"
New-Item -ItemType Directory -Path $TempDir | Out-Null

# ============================================================
# Repositório 1: mechanical-workshop-auth-function
# ============================================================
Write-Step "[1/4] Criando mechanical-workshop-auth-function..."

$Repo1Name = "mechanical-workshop-auth-function"
$Repo1Dir = Join-Path $TempDir $Repo1Name

# Copiar conteúdo
Copy-Item -Path (Join-Path $MainRepoPath "azure-function") -Destination $Repo1Dir -Recurse

# Criar README se não existir na raiz do novo repo (já existe em azure-function/)
# O README já está em azure-function/README.md, que vai para a raiz do Repo1Dir

# Inicializar git e criar repo remoto
Push-Location $Repo1Dir
    git init
    git checkout -b main
    git add .
    git commit -m "feat: initial commit - Azure Function CPF authentication"
    
    gh repo create "$GitHubOrg/$Repo1Name" --public --description "Azure Function serverless para autenticação via CPF e geração de JWT - Mechanical Workshop" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Repositório criado no GitHub."
    } else {
        Write-Warn "Repositório pode já existir. Tentando configurar remote..."
    }
    
    git remote add origin "https://github.com/$GitHubOrg/$Repo1Name.git" 2>$null
    git push -u origin main
    
    # Criar branch develop
    git checkout -b develop
    git push -u origin develop
    
    Write-Success "Branch main e develop criadas e publicadas."
Pop-Location

# ============================================================
# Repositório 2: mechanical-workshop-kubernetes-infra
# ============================================================
Write-Step "[2/4] Criando mechanical-workshop-kubernetes-infra..."

$Repo2Name = "mechanical-workshop-kubernetes-infra"
$Repo2Dir = Join-Path $TempDir $Repo2Name
New-Item -ItemType Directory -Path $Repo2Dir | Out-Null

# Copiar Terraform K8s
$Repo2TerraformDir = Join-Path $Repo2Dir "terraform"
Copy-Item -Path (Join-Path $MainRepoPath "terraform-kubernetes") -Destination $Repo2TerraformDir -Recurse
# Remover .github que está dentro (vamos criar na raiz)
Remove-Item -Path (Join-Path $Repo2TerraformDir ".github") -Recurse -Force -ErrorAction SilentlyContinue

# Copiar manifestos K8s
$Repo2K8sDir = Join-Path $Repo2Dir "k8s"
Copy-Item -Path (Join-Path $MainRepoPath "k8s") -Destination $Repo2K8sDir -Recurse

# Copiar README (criado por este script)
Copy-Item -Path (Join-Path $MainRepoPath "terraform-kubernetes\README.md") -Destination (Join-Path $Repo2Dir "README.md")

# Copiar workflow
$Repo2WorkflowDir = Join-Path $Repo2Dir ".github\workflows"
New-Item -ItemType Directory -Path $Repo2WorkflowDir -Force | Out-Null
Copy-Item -Path (Join-Path $MainRepoPath "terraform-kubernetes\.github\workflows\terraform.yml") -Destination (Join-Path $Repo2WorkflowDir "terraform.yml")

# Adicionar CODEOWNERS
$CodeownersDir = Join-Path $Repo2Dir ".github"
"* @$GitHubOrg/tech-leads" | Out-File -FilePath (Join-Path $CodeownersDir "CODEOWNERS") -Encoding utf8

Push-Location $Repo2Dir
    git init
    git checkout -b main
    git add .
    git commit -m "feat: initial commit - Kubernetes infrastructure with Terraform"
    
    gh repo create "$GitHubOrg/$Repo2Name" --public --description "Infraestrutura Kubernetes (AKS + K8s manifests) com Terraform - Mechanical Workshop" 2>$null
    git remote add origin "https://github.com/$GitHubOrg/$Repo2Name.git" 2>$null
    git push -u origin main
    
    git checkout -b develop
    git push -u origin develop
    Write-Success "Repositório Kubernetes criado e publicado."
Pop-Location

# ============================================================
# Repositório 3: mechanical-workshop-database-infra
# ============================================================
Write-Step "[3/4] Criando mechanical-workshop-database-infra..."

$Repo3Name = "mechanical-workshop-database-infra"
$Repo3Dir = Join-Path $TempDir $Repo3Name
New-Item -ItemType Directory -Path $Repo3Dir | Out-Null

# Copiar Terraform Database
$Repo3TerraformDir = Join-Path $Repo3Dir "terraform"
Copy-Item -Path (Join-Path $MainRepoPath "terraform-database") -Destination $Repo3TerraformDir -Recurse
Remove-Item -Path (Join-Path $Repo3TerraformDir ".github") -Recurse -Force -ErrorAction SilentlyContinue

# Copiar schema Prisma
$Repo3PrismaDir = Join-Path $Repo3Dir "prisma"
New-Item -ItemType Directory -Path $Repo3PrismaDir -Force | Out-Null
Copy-Item -Path (Join-Path $MainRepoPath "prisma\schema.postgresql.prisma") -Destination (Join-Path $Repo3PrismaDir "schema.prisma")

# Copiar README
Copy-Item -Path (Join-Path $MainRepoPath "terraform-database\README.md") -Destination (Join-Path $Repo3Dir "README.md")

# Copiar workflow
$Repo3WorkflowDir = Join-Path $Repo3Dir ".github\workflows"
New-Item -ItemType Directory -Path $Repo3WorkflowDir -Force | Out-Null
Copy-Item -Path (Join-Path $MainRepoPath "terraform-database\.github\workflows\terraform.yml") -Destination (Join-Path $Repo3WorkflowDir "terraform.yml")

# CODEOWNERS
$Repo3GhDir = Join-Path $Repo3Dir ".github"
"* @$GitHubOrg/tech-leads" | Out-File -FilePath (Join-Path $Repo3GhDir "CODEOWNERS") -Encoding utf8

Push-Location $Repo3Dir
    git init
    git checkout -b main
    git add .
    git commit -m "feat: initial commit - Database infrastructure with Terraform"
    
    gh repo create "$GitHubOrg/$Repo3Name" --public --description "Infraestrutura do Banco de Dados PostgreSQL gerenciado com Terraform - Mechanical Workshop" 2>$null
    git remote add origin "https://github.com/$GitHubOrg/$Repo3Name.git" 2>$null
    git push -u origin main
    
    git checkout -b develop
    git push -u origin develop
    Write-Success "Repositório Database criado e publicado."
Pop-Location

# ============================================================
# Repositório 4: mechanical-workshop-api (este repo atual)
# ============================================================
Write-Step "[4/4] Configurando mechanical-workshop-api (repo principal)..."

Push-Location $MainRepoPath
    # Verificar se já tem remote origin
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        Write-Success "Remote origin já configurado: $existingRemote"
    } else {
        gh repo create "$GitHubOrg/mechanical-workshop-api" --public --description "API REST para gestão de oficina mecânica - NestJS + TypeScript + Kubernetes" 2>$null
        git remote add origin "https://github.com/$GitHubOrg/mechanical-workshop-api.git"
        Write-Success "Remote origin configurado."
    }
    
    # Garantir branch develop
    git checkout -b develop 2>$null
    if ($LASTEXITCODE -ne 0) {
        git checkout develop 2>$null
    }
    git push -u origin develop 2>$null
    
    git checkout main 2>$null
    if ($LASTEXITCODE -ne 0) { git checkout -b main }
    git push -u origin main 2>$null
    Write-Success "Branches main e develop configuradas."
Pop-Location

# ============================================================
# Configurar branch protection
# ============================================================
Write-Step "Configurando Branch Protection nas 4 repos..."

$repos = @(
    $Repo1Name,
    $Repo2Name,
    $Repo3Name,
    "mechanical-workshop-api"
)

foreach ($repo in $repos) {
    $branchProtectionBody = @{
        required_status_checks = @{
            strict = $true
            contexts = @()
        }
        enforce_admins = $false
        required_pull_request_reviews = @{
            required_approving_review_count = 1
            dismiss_stale_reviews = $true
        }
        restrictions = $null
        allow_force_pushes = $false
        allow_deletions = $false
    } | ConvertTo-Json -Depth 5

    try {
        $tmpProtectionFile = [System.IO.Path]::GetTempFileName()
        $branchProtectionBody | Out-File -FilePath $tmpProtectionFile -Encoding utf8

        $result = gh api --method PUT "/repos/$GitHubOrg/$repo/branches/main/protection" --input $tmpProtectionFile 2>$null

        Remove-Item -Path $tmpProtectionFile -Force -ErrorAction SilentlyContinue
        Write-Success "Branch protection configurada para $repo"
    } catch {
        Write-Warn "Não foi possível configurar branch protection para $repo (requer GitHub Pro/Team para repos privados)"
    }
}

# ============================================================
# Adicionar colaborador soat-architecture
# ============================================================
Write-Step "Adicionando colaborador soat-architecture..."

foreach ($repo in $repos) {
    try {
        gh api --method PUT "/repos/$GitHubOrg/$repo/collaborators/soat-architecture" -f permission="admin" | Out-Null
        Write-Success "soat-architecture adicionado como admin em $repo"
    } catch {
        Write-Warn "Erro ao adicionar soat-architecture em $repo - faca manualmente em: https://github.com/$GitHubOrg/$repo/settings/access"
    }
}

# ============================================================
# Limpeza
# ============================================================
Write-Step "Limpando arquivos temporários..."
Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Success "Concluído."

# ============================================================
# Sumário
# ============================================================
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "           SETUP CONCLUIDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Repositórios criados:" -ForegroundColor White
Write-Host "  1. https://github.com/$GitHubOrg/mechanical-workshop-auth-function" -ForegroundColor Cyan
Write-Host "  2. https://github.com/$GitHubOrg/mechanical-workshop-kubernetes-infra" -ForegroundColor Cyan
Write-Host "  3. https://github.com/$GitHubOrg/mechanical-workshop-database-infra" -ForegroundColor Cyan
Write-Host "  4. https://github.com/$GitHubOrg/mechanical-workshop-api" -ForegroundColor Cyan
Write-Host ""
Write-Host 'Proximos passos MANUAIS:' -ForegroundColor Yellow
Write-Host '  1. Configure os GitHub Secrets em cada repositorio (ver README de cada um)'
Write-Host '  2. Confirme que soat-architecture foi adicionado em Settings / Collaborators'
Write-Host '  3. Verifique branch protection em Settings / Branches'
Write-Host '  4. Atualize os links no DELIVERY_DOCUMENT.md com as URLs reais'
Write-Host '  5. Grave e publique o video de demonstracao'
Write-Host ""
