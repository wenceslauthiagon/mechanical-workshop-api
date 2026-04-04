# Script para substituir imports de enums do Prisma para enums locais

$srcFiles = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse
$testFiles = Get-ChildItem -Path "test" -Filter "*.ts" -Recurse

$allFiles = $srcFiles + $testFiles

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    $relativePath = ""
    
    # Calcular o caminho relativo para shared/enums
    $depth = ($file.DirectoryName -replace [regex]::Escape((Get-Location).Path), "").Split([IO.Path]::DirectorySeparatorChar).Count - 1
    if ($file.DirectoryName -like "*\src\*") {
        $depth = ($file.DirectoryName -replace [regex]::Escape((Join-Path (Get-Location).Path "src")), "").Split([IO.Path]::DirectorySeparatorChar).Count - 1
        if ($depth -eq 0) {
            $relativePath = "./shared/enums"
        } else {
            $relativePath = ("../" * $depth) + "shared/enums"
            $relativePath = $relativePath.TrimEnd('/')
        }
    } elseif ($file.DirectoryName -like "*\test\*") {
        $relativePath = "../src/shared/enums"
    }
    
    # Substituir import de UserRole
    if ($content -match "import.*UserRole.*from '@prisma/client'") {
        $content = $content -replace "import \{ UserRole \} from '@prisma/client';", "import { UserRole } from '$relativePath';"
        $content = $content -replace "import \{ ([^,]+), UserRole([^}]*) \} from '@prisma/client';", "import { `$1`$2 } from '@prisma/client';`nimport { UserRole } from '$relativePath';"
        $content = $content -replace "import \{ UserRole, ([^}]+) \} from '@prisma/client';", "import { `$1 } from '@prisma/client';`nimport { UserRole } from '$relativePath';"
        $modified = $true
    }
    
    # Substituir import de ServiceOrderStatus
    if ($content -match "import.*ServiceOrderStatus.*from '@prisma/client'") {
        $content = $content -replace "import \{ ServiceOrderStatus \} from '@prisma/client';", "import { ServiceOrderStatus } from '$relativePath';"
        $content = $content -replace "import \{ ([^,]+), ServiceOrderStatus([^}]*) \} from '@prisma/client';", "import { `$1`$2 } from '@prisma/client';`nimport { ServiceOrderStatus } from '$relativePath';"
        $content = $content -replace "import \{ ServiceOrderStatus, ([^}]+) \} from '@prisma/client';", "import { `$1 } from '@prisma/client';`nimport { ServiceOrderStatus } from '$relativePath';"
        $modified = $true
    }
    
    # Substituir import de CustomerType
    if ($content -match "import.*CustomerType.*from '@prisma/client'") {
        $content = $content -replace "import \{ CustomerType \} from '@prisma/client';", "import { CustomerType } from '$relativePath';"
        $content = $content -replace "import \{ ([^,]+), CustomerType([^}]*) \} from '@prisma/client';", "import { `$1`$2 } from '@prisma/client';`nimport { CustomerType } from '$relativePath';"
        $content = $content -replace "import \{ CustomerType, ([^}]+) \} from '@prisma/client';", "import { `$1 } from '@prisma/client';`nimport { CustomerType } from '$relativePath';"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nDone!"
