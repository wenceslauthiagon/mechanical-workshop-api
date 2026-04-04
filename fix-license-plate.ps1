# Fix licensePlate to plate in test files
$testFiles = Get-ChildItem -Path "test/integration" -Filter "*.ts" -Recurse

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace licensePlate property with plate
    $newContent = $content -replace 'licensePlate\s*:', 'plate:'
    
    # Replace mockVehicle.licensePlate with mockVehicle.plate (in code, not in definitions)
    $newContent = $newContent -replace '\.licensePlate', '.plate'
    
    # Replace testLicensePlate variable with testPlate
    $newContent = $newContent -replace 'testLicensePlate', 'testPlate'
    
    # Replace uniquePlate is already correct
    
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nDone! All licensePlate references replaced with plate."
