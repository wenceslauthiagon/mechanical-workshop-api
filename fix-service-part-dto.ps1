# Fix service and part creation in test files by adding missing fields
$testFiles = Get-ChildItem -Path "test/integration" -Filter "*.ts" -Recurse

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Fix service creation: add category field if missing
    # Pattern: service creation without category
    if ($content -match 'post\([''"]/api/services[''"]\)[\s\S]*?\.send\(\{[^}]*estimatedMinutes[^}]*\}') {
        # Check if category is missing in service objects
        $newContent = $content -replace '(\s+price:\s*[^,]+,)(\s+)(estimatedMinutes:)', "`$1`$2category: 'Test Category',`$2`$3"
        if ($content -ne $newContent) {
            $content = $newContent
            $modified = $true
        }
    }
    
    # Fix part creation: add partNumber and minStock if missing
    # This is more complex, let's do it manually for critical files
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nNote: Some files may need manual updates for part objects."
Write-Host "Part objects need: partNumber (string), minStock (number)"
