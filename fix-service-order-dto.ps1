# Fix service order creation to include services and parts arrays
$testFiles = @(
    'test/integration/service-order.integration-spec.ts',
    'test/integration/public-service-order.integration-spec.ts',
    'test/integration/public-budget.integration-spec.ts',
    'test/integration/budget.integration-spec.ts',
    'test/integration/workflows/service-order-workflow.integration-spec.ts',
    'test/integration/workflows/complete-e2e-workflow.integration-spec.ts',
    'test/integration/workflows/budget-workflow.integration-spec.ts'
)

foreach ($file in $testFiles) {
    $content = Get-Content $file -Raw
    
    # Pattern 1: Add services and parts after description without comma
    $content = $content -replace '(description:\s*[^,}]+),(\s*}\s*;)', '$1,`r`n        services: [],`r`n        parts: []$2'
    
    # Pattern 2: Add services and parts when there are other optional fields after description
    $content = $content -replace '(description:\s*faker\.lorem\.sentence\(\)),(\s*}\s*;)', '$1,`r`n        services: [],`r`n        parts: []$2'
    
    Set-Content -Path $file -Value $content -NoNewline
    Write-Host "Updated: $file"
}

Write-Host "`nDone!"
