# Guia: Como Converter o Documento de Entrega para PDF

Este guia mostra como converter o documento Markdown em um PDF profissional para entrega no portal do aluno.

## 📄 Arquivo a Converter

`docs/DELIVERY_DOCUMENT_TEMPLATE.md`

## 🛠️ Métodos de Conversão

### Método 1: VS Code com Extensão (Recomendado)

1. **Instalar Extensão**
   - Abra VS Code
   - Vá em Extensions (Ctrl+Shift+X)
   - Busque: "Markdown PDF"
   - Instale: "Markdown PDF" by yzane

2. **Editar o Template**
   - Abra `docs/DELIVERY_DOCUMENT_TEMPLATE.md`
   - Preencha todos os campos marcados com `[...]`:
     - Nome dos membros da equipe
     - RMs
     - URLs dos repositórios GitHub
     - URL do vídeo YouTube
     - IDs de dashboards, etc.

3. **Configurar Estilo (Opcional)**
   
   Criar arquivo `.vscode/settings.json`:
   ```json
   {
     "markdown-pdf.format": "A4",
     "markdown-pdf.displayHeaderFooter": true,
     "markdown-pdf.headerTemplate": "<div style='font-size: 9px; margin-left: 1cm;'>Tech Challenge - Sistema de Oficina Mecânica</div>",
     "markdown-pdf.footerTemplate": "<div style='font-size: 9px; margin: 0 auto;'>Página <span class='pageNumber'></span> de <span class='totalPages'></span></div>",
     "markdown-pdf.margin.top": "2cm",
     "markdown-pdf.margin.bottom": "2cm",
     "markdown-pdf.margin.left": "2cm",
     "markdown-pdf.margin.right": "2cm"
   }
   ```

4. **Converter**
   - Com o arquivo aberto, aperte `Ctrl+Shift+P`
   - Digite: "Markdown PDF: Export (pdf)"
   - Aguarde a conversão
   - PDF será salvo na mesma pasta

5. **Verificar PDF**
   - Abra o PDF gerado
   - Verifique se todos os links estão clicáveis
   - Confira formatação e paginação

---

### Método 2: Pandoc (Linha de Comando)

1. **Instalar Pandoc**
   ```powershell
   # Via Chocolatey
   choco install pandoc
   
   # Ou baixe do site oficial
   # https://pandoc.org/installing.html
   ```

2. **Instalar LaTeX (para PDFs)**
   ```powershell
   # Via Chocolatey
   choco install miktex
   
   # Ou baixe MiKTeX
   # https://miktex.org/download
   ```

3. **Converter para PDF**
   ```powershell
   cd docs
   
   pandoc DELIVERY_DOCUMENT_TEMPLATE.md `
     -o ENTREGA_TECH_CHALLENGE.pdf `
     --pdf-engine=xelatex `
     --toc `
     --toc-depth=2 `
     -V geometry:margin=2cm `
     -V fontsize=11pt `
     -V documentclass=article `
     -V colorlinks=true `
     -V linkcolor=blue `
     -V urlcolor=blue
   ```

---

### Método 3: Online (Sem Instalação)

1. **Acessar Conversor Online**
   - Opção 1: https://www.markdowntopdf.com/
   - Opção 2: https://md2pdf.netlify.app/
   - Opção 3: https://cloudconvert.com/md-to-pdf

2. **Upload do Arquivo**
   - Faça upload de `DELIVERY_DOCUMENT_TEMPLATE.md` (preenchido)
   - Ou copie e cole o conteúdo

3. **Converter**
   - Clique em "Convert" ou "Generate PDF"
   - Download do PDF

4. **Verificar**
   - Abra o PDF
   - Confira links e formatação
   - Se necessário, ajuste no Markdown e reconverta

---

### Método 4: Typora (App Pago mas com Trial)

1. **Instalar Typora**
   - Download: https://typora.io/
   - Trial gratuito de 15 dias

2. **Abrir Arquivo**
   - Abra `DELIVERY_DOCUMENT_TEMPLATE.md` no Typora
   - Preencha os campos

3. **Exportar para PDF**
   - File → Export → PDF
   - Escolha destino
   - Salve

---

## ✏️ Checklist Antes de Converter

Certifique-se de que o template está completo:

- [ ] Nomes dos membros da equipe preenchidos
- [ ] RMs preenchidos
- [ ] URLs dos 4 repositórios GitHub corretas
- [ ] URL do vídeo YouTube correta
- [ ] IDs de dashboards atualizados
- [ ] Subscription ID da Azure preenchido
- [ ] Todos os `[...]` substituídos por valores reais
- [ ] Assinatura e data preenchidas

## 🎨 Melhorias Visuais (Opcional)

### Adicionar Logo da FIAP

1. Baixe o logo da FIAP (PNG)
2. Salve em `docs/images/fiap-logo.png`
3. Adicione no topo do documento:
   ```markdown
   ![FIAP](./images/fiap-logo.png)
   ```

### Adicionar Screenshots

1. Tire prints de:
   - Dashboard Datadog
   - Pipeline CI/CD rodando
   - kubectl get all
   - Postman com autenticação

2. Salve em `docs/images/`
3. Adicione no Anexos do documento:
   ```markdown
   ## Anexos
   
   ### A. Dashboard Datadog
   ![Dashboard](./images/dashboard.png)
   
   ### B. CI/CD Pipeline
   ![CI/CD](./images/cicd.png)
   ```

## 📤 Entrega Final

### Nomenclatura do Arquivo

Sugestão: `TECH_CHALLENGE_FASE3_GRUPO_[NUMERO]_[DATA].pdf`

Exemplo: `TECH_CHALLENGE_FASE3_GRUPO_05_2024-03-15.pdf`

### Tamanho do Arquivo

- **Target**: < 5MB
- Se exceder:
  - Comprimir imagens (TinyPNG)
  - Reduzir resolução de screenshots
  - Remover imagens desnecessárias

### Upload no Portal

1. Acesse o portal do aluno
2. Localize a entrega do Tech Challenge - Fase 3
3. Faça upload do PDF
4. Confirme o envio
5. **Importante**: Guarde uma cópia do PDF enviado

## ✅ Validação Final

Antes de enviar, verifique:

- [ ] PDF abre corretamente
- [ ] Todos os links estão clicáveis
- [ ] Formatação está correta
- [ ] Não há texto cortado
- [ ] Imagens (se houver) estão visíveis
- [ ] Índice/TOC está correto
- [ ] Numeração de páginas está ok
- [ ] Tamanho < 5MB

## 🆘 Problemas Comuns

### Links não estão clicáveis no PDF

**Solução**: Use Pandoc com flag `--colorlinks=true` ou VS Code com configuração de PDF interativo.

### Imagens não aparecem

**Solução**: Use caminhos relativos (`./images/file.png`) ao invés de absolutos.

### Formatação quebrada

**Solução**: Evite HTML complexo no Markdown. Use apenas Markdown puro.

### PDF muito grande

**Solução**:
```powershell
# Comprimir PDF com Ghostscript
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 `
   -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH `
   -sOutputFile=compressed.pdf input.pdf
```

## 📞 Dúvidas

Se tiver problemas na conversão:

1. Consulte a documentação da ferramenta usada
2. Verifique se o Markdown está válido
3. Teste com conversores online alternativos
4. Use a opção mais simples (VS Code + extensão)

---

**Sucesso na entrega! 🎉**

Documento pronto para conversão: `docs/DELIVERY_DOCUMENT_TEMPLATE.md`  
Arquivo de saída sugerido: `TECH_CHALLENGE_FASE3_GRUPO_XX_2024-03-15.pdf`
