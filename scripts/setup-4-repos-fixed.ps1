param(
  [Parameter(Mandatory=$true)]
  [string]$GitHubOrg,

  [Parameter(Mandatory=$false)]
  [string]$MainRepoPath = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

# Em PowerShell 7, alguns comandos nativos (ex.: git) escrevem mensagens
# informativas no stderr. Isso nao deve interromper o script.
if ($null -ne (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue)) {
  $PSNativeCommandUseErrorActionPreference = $false
}

function Step($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "   [OK] $m" -ForegroundColor Green }
function Warn($m) { Write-Host "   [!!] $m" -ForegroundColor Yellow }

function Push-Branch($remote, $branch) {
  $stdout1 = [System.IO.Path]::GetTempFileName()
  $stderr1 = [System.IO.Path]::GetTempFileName()

  $p1 = Start-Process -FilePath "git" -ArgumentList @("push", "-u", $remote, $branch) -NoNewWindow -Wait -PassThru -RedirectStandardOutput $stdout1 -RedirectStandardError $stderr1
  Get-Content $stdout1 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
  Get-Content $stderr1 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
  Remove-Item $stdout1, $stderr1 -Force -ErrorAction SilentlyContinue

  if ($p1.ExitCode -ne 0) {
    Warn "Push rejeitado para '$branch'. Tentando sincronizar com --force-with-lease..."

    $stdout2 = [System.IO.Path]::GetTempFileName()
    $stderr2 = [System.IO.Path]::GetTempFileName()
    $p2 = Start-Process -FilePath "git" -ArgumentList @("push", "-u", $remote, $branch, "--force-with-lease") -NoNewWindow -Wait -PassThru -RedirectStandardOutput $stdout2 -RedirectStandardError $stderr2
    Get-Content $stdout2 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
    Get-Content $stderr2 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
    Remove-Item $stdout2, $stderr2 -Force -ErrorAction SilentlyContinue

    if ($p2.ExitCode -ne 0) {
      Warn "--force-with-lease falhou (stale info). Tentando --force para reconciliar branch remota..."

      $stdout3 = [System.IO.Path]::GetTempFileName()
      $stderr3 = [System.IO.Path]::GetTempFileName()
      $p3 = Start-Process -FilePath "git" -ArgumentList @("push", "-u", $remote, $branch, "--force") -NoNewWindow -Wait -PassThru -RedirectStandardOutput $stdout3 -RedirectStandardError $stderr3
      Get-Content $stdout3 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
      Get-Content $stderr3 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
      Remove-Item $stdout3, $stderr3 -Force -ErrorAction SilentlyContinue

      if ($p3.ExitCode -ne 0) {
        throw "Falha ao publicar branch '$branch' no remoto '$remote'."
      }
    }
  }
}

function Copy-TreeFiltered($source, $dest) {
  New-Item -ItemType Directory -Path $dest -Force | Out-Null

  $excludeDirs = @(
    "node_modules",
    ".git",
    ".terraform",
    "coverage",
    "logs",
    "dist",
    "build",
    ".next"
  )

  $robocopyArgs = @(
    $source,
    $dest,
    "/E",
    "/R:1",
    "/W:1",
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS",
    "/NP",
    "/XD"
  ) + $excludeDirs

  $rc = Start-Process -FilePath robocopy.exe -ArgumentList $robocopyArgs -NoNewWindow -Wait -PassThru

  if ($rc.ExitCode -ge 8) {
    throw "Copy failed from '$source' to '$dest' (robocopy exit code $($rc.ExitCode))."
  }
}

Step "Checking prerequisites"
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI not found. Install with: winget install GitHub.cli"
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git not found."
}

gh auth status | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Not authenticated in gh. Run: gh auth login"
}
Ok "Prerequisites OK"

$SourceBranch = (git -C $MainRepoPath rev-parse --abbrev-ref HEAD).Trim()
Ok "Using source branch: $SourceBranch"

$TempDir = Join-Path $env:TEMP ("mw-repos-" + (Get-Random))
New-Item -ItemType Directory -Path $TempDir | Out-Null

$Repo1 = "mechanical-workshop-auth-function"
$Repo2 = "mechanical-workshop-kubernetes-infra"
$Repo3 = "mechanical-workshop-database-infra"
$Repo4 = "mechanical-workshop-api"

function Init-Repo($localPath, $repoName, $description, $defaultBranch) {
  Push-Location $localPath
  try {
    git init | Out-Null
    git checkout -b $defaultBranch | Out-Null
    git add .
    git commit -m "chore: initial commit" | Out-Null

    gh repo view "$GitHubOrg/$repoName" 1>$null 2>$null
    if ($LASTEXITCODE -ne 0) {
      gh repo create "$GitHubOrg/$repoName" --public --description $description 2>$null
    }
    git remote add origin "https://github.com/$GitHubOrg/$repoName.git" 2>$null

    Push-Branch -remote "origin" -branch $defaultBranch

    Ok "$repoName pushed (branch: $defaultBranch)"
  }
  finally { Pop-Location }
}

# Repo 1
Step "[1/4] Creating $Repo1"
$R1 = Join-Path $TempDir $Repo1
Copy-TreeFiltered -source (Join-Path $MainRepoPath "azure-function") -dest $R1
Init-Repo -localPath $R1 -repoName $Repo1 -description "Serverless auth function (CPF + JWT)" -defaultBranch $SourceBranch

# Repo 2
Step "[2/4] Creating $Repo2"
$R2 = Join-Path $TempDir $Repo2
New-Item -ItemType Directory -Path $R2 | Out-Null
Copy-TreeFiltered -source (Join-Path $MainRepoPath "k8s") -dest (Join-Path $R2 "k8s")
Copy-TreeFiltered -source (Join-Path $MainRepoPath "terraform-kubernetes") -dest (Join-Path $R2 "terraform")
Copy-Item -Path (Join-Path $MainRepoPath "terraform-kubernetes\README.md") -Destination (Join-Path $R2 "README.md")
New-Item -ItemType Directory -Path (Join-Path $R2 ".github\workflows") -Force | Out-Null
Copy-Item -Path (Join-Path $MainRepoPath "terraform-kubernetes\.github\workflows\terraform.yml") -Destination (Join-Path $R2 ".github\workflows\terraform.yml")
"* @soat-architecture" | Out-File -FilePath (Join-Path $R2 ".github\CODEOWNERS") -Encoding utf8
Init-Repo -localPath $R2 -repoName $Repo2 -description "AKS + Kubernetes manifests with Terraform" -defaultBranch $SourceBranch

# Repo 3
Step "[3/4] Creating $Repo3"
$R3 = Join-Path $TempDir $Repo3
New-Item -ItemType Directory -Path $R3 | Out-Null
Copy-TreeFiltered -source (Join-Path $MainRepoPath "terraform-database") -dest (Join-Path $R3 "terraform")
New-Item -ItemType Directory -Path (Join-Path $R3 "prisma") -Force | Out-Null
Copy-Item -Path (Join-Path $MainRepoPath "prisma\schema.postgresql.prisma") -Destination (Join-Path $R3 "prisma\schema.prisma")
Copy-Item -Path (Join-Path $MainRepoPath "terraform-database\README.md") -Destination (Join-Path $R3 "README.md")
New-Item -ItemType Directory -Path (Join-Path $R3 ".github\workflows") -Force | Out-Null
Copy-Item -Path (Join-Path $MainRepoPath "terraform-database\.github\workflows\terraform.yml") -Destination (Join-Path $R3 ".github\workflows\terraform.yml")
"* @soat-architecture" | Out-File -FilePath (Join-Path $R3 ".github\CODEOWNERS") -Encoding utf8
Init-Repo -localPath $R3 -repoName $Repo3 -description "Managed PostgreSQL infra with Terraform" -defaultBranch $SourceBranch

# Repo 4 (current)
Step "[4/4] Pushing $Repo4"
Push-Location $MainRepoPath
try {
  $currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
  $existing = git remote get-url origin 2>$null
  if (-not $existing) {
    gh repo create "$GitHubOrg/$Repo4" --public --description "Main API (NestJS)" 2>$null
    git remote add origin "https://github.com/$GitHubOrg/$Repo4.git" 2>$null
  }

  Push-Branch -remote "origin" -branch $currentBranch
  Ok "$Repo4 pushed (current branch: $currentBranch)"

  Warn "Nao foi feito checkout para main/develop para nao sobrescrever alteracoes locais."
  Warn "Depois, faca merge da sua feature para develop/main via Pull Request."
}
finally { Pop-Location }

# Add collaborator and branch protection
Step "Applying collaborator and branch protection"
$repos = @($Repo1,$Repo2,$Repo3,$Repo4)
foreach ($r in $repos) {
  try {
    gh api --method PUT "/repos/$GitHubOrg/$r/collaborators/soat-architecture" -f permission=admin | Out-Null
    Ok "soat-architecture invited on $r"
  } catch {
    Warn "Could not invite collaborator on $r"
  }

  try {
    gh api --method PUT "/repos/$GitHubOrg/$r/branches/$SourceBranch/protection" `
      -f required_status_checks.strict=true `
      -F required_status_checks.contexts[]='' `
      -f enforce_admins=false `
      -f required_pull_request_reviews.required_approving_review_count=1 `
      -f required_pull_request_reviews.dismiss_stale_reviews=true `
      -f restrictions= | Out-Null
    Ok "Branch protection set on $r"
  } catch {
    Warn "Could not set branch protection on $r"
  }
}

Step "Cleaning temp folder"
Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`nDONE" -ForegroundColor Green
Write-Host "Repos:" -ForegroundColor White
Write-Host " - https://github.com/$GitHubOrg/$Repo1"
Write-Host " - https://github.com/$GitHubOrg/$Repo2"
Write-Host " - https://github.com/$GitHubOrg/$Repo3"
Write-Host " - https://github.com/$GitHubOrg/$Repo4"
