# Script para remover imports não utilizados de ServiceOrderStatus nos testes

$files = @(
    "test/workshop/2-application/services/part.service.spec.ts",
    "test/workshop/2-application/services/service.service.spec.ts",
    "test/workshop/1-presentation/controllers/customer.controller.spec.ts",
    "test/workshop/3-domain/aggregates/customer.aggregate.spec.ts",
    "test/shared/services/email.service.spec.ts"
)

foreach ($filePath in $files) {
    $fullPath = "w:/projects/mechanical-workshop-api/$filePath"
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Remove a linha do import de ServiceOrderStatus
        $content = $content -replace "import\s*{\s*ServiceOrderStatus\s*}\s*from\s*['""][^'""]+service-order-status\.enum['""];\r?\n", ""
        
        Set-Content -Path $fullPath -Value $content -NoNewline
        Write-Host "Removed unused import from: $filePath"
    }
}

Write-Host "`nDone!"
