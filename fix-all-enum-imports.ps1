# Script para corrigir todos os imports de enums

$files = Get-ChildItem -Path "src", "test" -Recurse -Include *.ts -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Corrigir ServiceOrderStatus
    if ($content -match "from\s+['""].*\/shared\/enums['""]") {
        # Para src/ - 3 níveis acima
        $content = $content -replace "import\s*{\s*ServiceOrderStatus\s*}\s*from\s+['""]\.\.\/\.\.\/\.\.\/shared\/enums['""];", "import { ServiceOrderStatus } from '../../../shared/enums/service-order-status.enum';"
        # Para test/ - 5 níveis acima  
        $content = $content -replace "import\s*{\s*ServiceOrderStatus\s*}\s*from\s+['""]\.\.\/\.\.\/\.\.\/\.\.\/src\/shared\/enums['""];", "import { ServiceOrderStatus } from '../../../../src/shared/enums/service-order-status.enum';"
        
        # Para CustomerType
        $content = $content -replace "import\s*{\s*CustomerType\s*}\s*from\s+['""]\.\.\/\.\.\/\.\.\/shared\/enums['""];", "import { CustomerType } from '../../../shared/enums/customer-type.enum';"
        $content = $content -replace "import\s*{\s*CustomerType\s*}\s*from\s+['""]\.\.\/\.\.\/\.\.\/\.\.\/shared\/enums['""];", "import { CustomerType } from '../../../../shared/enums/customer-type.enum';"
        $content = $content -replace "import\s*{\s*CustomerType\s*}\s*from\s+['""]\.\.\/\.\.\/\.\.\/\.\.\/src\/shared\/enums['""];", "import { CustomerType } from '../../../../src/shared/enums/customer-type.enum';"
        
        # Para UserRole
        $content = $content -replace "import\s*{\s*UserRole\s*}\s*from\s+['""]\.\.\/\.\.\/\.\.\/shared\/enums['""];", "import { UserRole } from '../../../shared/enums/user-role.enum';"
        $content = $content -replace "import\s*{\s*UserRole\s*}\s*from\s+['""]\.\.\/\.\.\/shared\/enums['""];", "import { UserRole } from '../../shared/enums/user-role.enum';"
        $content = $content -replace "import\s*{\s*UserRole\s*}\s*from\s+['""]\.\.\/\.\.\/\.\.\/\.\.\/src\/shared\/enums['""];", "import { UserRole } from '../../../../src/shared/enums/user-role.enum';"
        
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nDone!"
