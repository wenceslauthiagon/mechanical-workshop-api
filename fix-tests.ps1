# Script para corrigir todos os testes após mudanças no schema

$testFiles = Get-ChildItem -Path "test" -Filter "*.ts" -Recurse

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Remover linhas de budget e mechanic deleteMany
    if ($content -match "await prisma\.budgetItem\.deleteMany\(\);") {
        $content = $content -replace "    await prisma\.budgetItem\.deleteMany\(\);`r?`n", ""
        $modified = $true
    }
    if ($content -match "await prisma\.budget\.deleteMany\(\);") {
        $content = $content -replace "    await prisma\.budget\.deleteMany\(\);`r?`n", ""
        $modified = $true
    }
    if ($content -match "await prisma\.mechanic\.deleteMany\(\);") {
        $content = $content -replace "    await prisma\.mechanic\.deleteMany\(\);`r?`n", ""
        $modified = $true
    }
    
    # Remover imports de enums que não existem mais
    if ($content -match "import.*CustomerType.*from '@prisma/client'") {
        $content = $content -replace ", CustomerType", ""
        $content = $content -replace "CustomerType, ", ""
        $content = $content -replace "import \{ CustomerType \} from '@prisma/client';`r?`n", ""
        $modified = $true
    }
    if ($content -match "import.*ServiceOrderStatus.*from '@prisma/client'") {
        $content = $content -replace ", ServiceOrderStatus", ""
        $content = $content -replace "ServiceOrderStatus, ", ""
        $content = $content -replace "import \{ ServiceOrderStatus \} from '@prisma/client';`r?`n", ""
        $modified = $true
    }
    if ($content -match "import.*UserRole.*from '@prisma/client'") {
        $content = $content -replace ", UserRole", ""
        $content = $content -replace "UserRole, ", ""
        $content = $content -replace "import \{ UserRole \} from '@prisma/client';`r?`n", ""
        $modified = $true
    }
    
    # Converter Prisma.Decimal para number
    if ($content -match "Prisma\.Decimal") {
        $content = $content -replace "price:\s*new Prisma\.Decimal\(([^)]+)\)", "price: `$1"
        $content = $content -replace "const newPrice = new Prisma\.Decimal\('([^']+)'\);", "const newPrice = `$1;"
        $modified = $true
    }
    
    # Remover .toNumber() de prices
    if ($content -match "\.toNumber\(\)") {
        $content = $content -replace "\.price\.toNumber\(\)", ".price"
        $content = $content -replace "partData\.price\.toNumber\(\)", "partData.price"
        $content = $content -replace "serviceData\.price\.toNumber\(\)", "serviceData.price"
        $content = $content -replace "newPrice\.toNumber\(\)", "newPrice"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nDone! Fixed all test files."
