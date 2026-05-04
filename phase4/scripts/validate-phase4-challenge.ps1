$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$services = @(
  @{ Name = 'os-service'; Path = Join-Path $root 'os-service'; DbType = 'sql' },
  @{ Name = 'billing-service'; Path = Join-Path $root 'billing-service'; DbType = 'sql' },
  @{ Name = 'execution-service'; Path = Join-Path $root 'execution-service'; DbType = 'nosql' }
)

$requiredServiceFiles = @(
  'package.json',
  'Dockerfile',
  'k8s/deployment.yaml',
  'jest.config.js',
  'src/app.ts'
)

$requiredWorkflows = @(
  '.github/workflows/phase4-os-service-cicd.yml',
  '.github/workflows/phase4-billing-service-cicd.yml',
  '.github/workflows/phase4-execution-service-cicd.yml'
)

$requiredDocs = @(
  'docs/architecture.md',
  'docs/ENTREGA_FASE4.md',
  'docs/Mechanical-Workshop-Phase4.postman_collection.json'
)

$requiredBdd = @(
  'os-service/test/bdd/os-saga.feature',
  'os-service/test/bdd/os-saga.spec.ts'
)

$coverageMin = 80
$errors = New-Object System.Collections.Generic.List[string]

function Assert-Exists {
  param(
    [string]$Path,
    [string]$Label
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    $errors.Add("Missing: $Label ($Path)")
  }
}

Write-Host '=== Phase 4 Challenge Validation ==='

foreach ($svc in $services) {
  Write-Host "Checking service: $($svc.Name)"

  if (-not (Test-Path -LiteralPath $svc.Path)) {
    $errors.Add("Missing service folder: $($svc.Path)")
    continue
  }

  foreach ($rel in $requiredServiceFiles) {
    Assert-Exists -Path (Join-Path $svc.Path $rel) -Label "$($svc.Name)/$rel"
  }

  $pkgPath = Join-Path $svc.Path 'package.json'
  if (Test-Path -LiteralPath $pkgPath) {
    $pkg = Get-Content -LiteralPath $pkgPath -Raw | ConvertFrom-Json

    if (-not $pkg.scripts.test) {
      $errors.Add("$($svc.Name): missing npm script test")
    }

    if (-not $pkg.scripts.'test:cov') {
      $errors.Add("$($svc.Name): missing npm script test:cov")
    }

    if ($svc.DbType -eq 'nosql') {
      $hasMongo = $false
      if ($pkg.dependencies -and $pkg.dependencies.mongodb) {
        $hasMongo = $true
      }
      if (-not $hasMongo) {
        $errors.Add("$($svc.Name): expected mongodb dependency for NoSQL service")
      }
    }
  }

  $coveragePath = Join-Path $svc.Path 'coverage/coverage-summary.json'
  if (Test-Path -LiteralPath $coveragePath) {
    $coverage = Get-Content -LiteralPath $coveragePath -Raw | ConvertFrom-Json
    foreach ($metric in @('lines', 'statements', 'functions', 'branches')) {
      $pct = [double]$coverage.total.$metric.pct
      if ($pct -lt $coverageMin) {
        $errors.Add("$($svc.Name): coverage $metric below $coverageMin% ($pct%)")
      }
    }
  } else {
    Write-Host "Coverage report not found for $($svc.Name): $coveragePath"
  }
}

$repoRoot = Split-Path -Parent $root
foreach ($wf in $requiredWorkflows) {
  Assert-Exists -Path (Join-Path $repoRoot $wf) -Label $wf
}

foreach ($doc in $requiredDocs) {
  Assert-Exists -Path (Join-Path $root $doc) -Label $doc
}

foreach ($bdd in $requiredBdd) {
  Assert-Exists -Path (Join-Path $root $bdd) -Label $bdd
}

if ($errors.Count -gt 0) {
  Write-Host ''
  Write-Host 'Validation FAILED:' -ForegroundColor Red
  $errors | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host ''
Write-Host 'Validation PASSED. Mandatory challenge checks found.' -ForegroundColor Green
exit 0
