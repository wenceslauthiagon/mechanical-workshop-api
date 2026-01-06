# Script para corrigir os problemas restantes nos testes

Write-Host "Corrigindo enums em português para inglês em todos os arquivos de teste..."

# Mapeamento de enums português -> inglês
$enumMapping = @{
    'ServiceOrderStatus\.RECEBIDA' = 'ServiceOrderStatus.RECEIVED'
    'ServiceOrderStatus\.EM_DIAGNOSTICO' = 'ServiceOrderStatus.IN_DIAGNOSIS'
    'ServiceOrderStatus\.AGUARDANDO_APROVACAO' = 'ServiceOrderStatus.AWAITING_APPROVAL'
    'ServiceOrderStatus\.EM_EXECUCAO' = 'ServiceOrderStatus.IN_EXECUTION'
    'ServiceOrderStatus\.FINALIZADA' = 'ServiceOrderStatus.FINISHED'
    'ServiceOrderStatus\.ENTREGUE' = 'ServiceOrderStatus.DELIVERED'
}

# Arquivos que precisam de correção de enum
$testFiles = Get-ChildItem -Path "test" -Recurse -Include *.spec.ts -File

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($oldPattern in $enumMapping.Keys) {
        $newValue = $enumMapping[$oldPattern]
        if ($content -match $oldPattern) {
            $content = $content -replace $oldPattern, $newValue
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Fixed enums: $($file.FullName)"
    }
}

Write-Host "`nCorrigindo imports faltando em email.service.spec.ts..."
$emailTestPath = "test/shared/services/email.service.spec.ts"
$content = Get-Content $emailTestPath -Raw
if ($content -notmatch "import.*ServiceOrderStatus.*from") {
    # Adicionar import de ServiceOrderStatus após Test
    $content = $content -replace "(import { Test.*\n)", "`$1import { ServiceOrderStatus } from '../../../src/shared/enums/service-order-status.enum';`n"
    Set-Content -Path $emailTestPath -Value $content -NoNewline
    Write-Host "  Added ServiceOrderStatus import"
}

Write-Host "`nCorrigindo imports faltando em customer.controller.spec.ts..."
$customerTestPath = "test/workshop/1-presentation/controllers/customer.controller.spec.ts"
$content = Get-Content $customerTestPath -Raw
if ($content -notmatch "import.*CustomerType.*from") {
    # Adicionar import de CustomerType após Test
    $content = $content -replace "(import { Test.*\n)", "`$1import { CustomerType } from '../../../../src/shared/enums/customer-type.enum';`n"
    Set-Content -Path $customerTestPath -Value $content -NoNewline
    Write-Host "  Added CustomerType import"
}

Write-Host "`nCorrigindo import não usado em part.service.spec.ts..."
$partTestPath = "test/workshop/2-application/services/part.service.spec.ts"
$content = Get-Content $partTestPath -Raw
$content = $content -replace "import { Decimal } from '@prisma/client/runtime/library';\r?\n", ""
Set-Content -Path $partTestPath -Value $content -NoNewline
Write-Host "  Removed unused Decimal import"

Write-Host "`nCorrigindo import faltando em service-order.controller.spec.ts..."
$soControllerPath = "test/workshop/1-presentation/controllers/service-order.controller.spec.ts"
if (Test-Path $soControllerPath) {
    $content = Get-Content $soControllerPath -Raw
    if ($content -notmatch "import.*ServiceOrderStatus.*from") {
        # Adicionar import de ServiceOrderStatus
        $content = $content -replace "(import { Test.*\n)", "`$1import { ServiceOrderStatus } from '../../../../src/shared/enums/service-order-status.enum';`n"
        Set-Content -Path $soControllerPath -Value $content -NoNewline
        Write-Host "  Added ServiceOrderStatus import"
    }
}

Write-Host "`nTodas as correcoes foram aplicadas!"
