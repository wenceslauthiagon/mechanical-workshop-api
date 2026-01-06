# Fix Portuguese enum expectations in integration tests to English
$testFiles = Get-ChildItem -Path "test/integration" -Filter "*.ts" -Recurse

$replacements = @{
    "'RECEBIDA'" = "'RECEIVED'"
    '"RECEBIDA"' = '"RECEIVED"'
    "'EM_DIAGNOSTICO'" = "'IN_DIAGNOSIS'"
    '"EM_DIAGNOSTICO"' = '"IN_DIAGNOSIS"'
    "'AGUARDANDO_APROVACAO'" = "'AWAITING_APPROVAL'"
    '"AGUARDANDO_APROVACAO"' = '"AWAITING_APPROVAL"'
    "'EM_EXECUCAO'" = "'IN_EXECUTION'"
    '"EM_EXECUCAO"' = '"IN_EXECUTION"'
    "'FINALIZADA'" = "'FINISHED'"
    '"FINALIZADA"' = '"FINISHED"'
    "'ENTREGUE'" = "'DELIVERED'"
    '"DELIVERED"' = '"DELIVERED"'
    "'RASCUNHO'" = "'DRAFT'"
    '"RASCUNHO"' = '"DRAFT"'
    "'ENVIADO'" = "'SENT'"
    '"ENVIADO"' = '"SENT"'
    "'APROVADO'" = "'APPROVED'"
    '"APROVADO"' = '"APPROVED"'
    "'REJEITADO'" = "'REJECTED'"
    '"REJEITADO"' = '"REJECTED"'
}

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($find in $replacements.Keys) {
        $replace = $replacements[$find]
        if ($content -match [regex]::Escape($find)) {
            $content = $content -replace [regex]::Escape($find), $replace
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nDone! All enum values converted from Portuguese to English."
