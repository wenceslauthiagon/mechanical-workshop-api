# Script para converter Decimal para number nos mocks de testes

Write-Host "Corrigindo mocks em service.service.spec.ts..."
$serviceTestPath = "test/workshop/2-application/services/service.service.spec.ts"
$content = Get-Content $serviceTestPath -Raw

# Substituir new Decimal(...) por parseFloat(...)
$content = $content -replace 'price: new Decimal\(faker\.finance\.amount\(\{ min: \d+, max: \d+, dec: \d+ \}\)\)', 'price: parseFloat(faker.finance.amount({ min: 50, max: 500, dec: 2 }))'

# Remover import de Decimal
$content = $content -replace "import { Decimal } from '@prisma/client/runtime/library';\r?\n", ""

Set-Content -Path $serviceTestPath -Value $content -NoNewline
Write-Host "  Fixed service.service.spec.ts"

Write-Host "`nCorrigindo mocks em service-stats.service.spec.ts..."
$statsTestPath = "test/workshop/2-application/services/service-stats.service.spec.ts"
$content = Get-Content $statsTestPath -Raw

# Substituir new Decimal(...) no createMockService
$content = $content -replace 'price: new Decimal\(faker\.finance\.amount\(\{ min: \d+, max: \d+, dec: \d+ \}\)\)', 'price: parseFloat(faker.finance.amount({ min: 50, max: 500, dec: 2 }))'

# Substituir new Decimal('...') para números
$content = $content -replace "estimatedTimeHours: new Decimal\('(\d+\.?\d*)'\)", 'estimatedTimeHours: $1'
$content = $content -replace "totalServicePrice: new Decimal\('(\d+\.?\d*)'\)", 'totalServicePrice: $1'
$content = $content -replace "totalPartsPrice: new Decimal\('(\d+\.?\d*)'\)", 'totalPartsPrice: $1'
$content = $content -replace "totalPrice: new Decimal\('(\d+\.?\d*)'\)", 'totalPrice: $1'

# Remover import de Decimal
$content = $content -replace "import { Decimal } from '@prisma/client/runtime/library';\r?\n", ""

Set-Content -Path $statsTestPath -Value $content -NoNewline
Write-Host "  Fixed service-stats.service.spec.ts"

Write-Host "`nTodas as correcoes de Decimal foram aplicadas!"
