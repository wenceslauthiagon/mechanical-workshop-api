# 📧 Sistema de Notificações - FÁCIL DE TROCAR

## 🚀 Como Usar

### 1. **Configuração Atual (GRATUITA)**
```bash
# No .env
NOTIFICATION_EMAIL_PROVIDER=gmail    # Gratuito com Gmail
NOTIFICATION_SMS_PROVIDER=mock       # Mock (sem custo)

# Gmail SMTP (Gratuito - 500 emails/dia)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
<<<<<<< HEAD
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
=======
SMTP_USER=example@example.com
SMTP_PASS=REPLACE_WITH_SMTP_APP_PASSWORD
>>>>>>> develop
```

### 2. **Para Trocar para Serviços Pagos (FÁCIL)**

#### **Email - SendGrid** (Quando quiser pago)
```bash
# Mude apenas estas linhas no .env:
NOTIFICATION_EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.sua-chave-aqui
SENDGRID_FROM_EMAIL=noreply@seudominio.com
```

#### **SMS - Twilio** (Quando quiser SMS real)
```bash
# Mude apenas estas linhas no .env:
NOTIFICATION_SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=seu-sid
TWILIO_AUTH_TOKEN=seu-token
TWILIO_FROM_PHONE=+5511999999999
```

## 🔄 Providers Disponíveis

### **Email Providers:**
- ✅ `gmail` - **GRATUITO** (500 emails/dia)
- 🔜 `sendgrid` - **PAGO** (melhor entregabilidade)
- 🔜 `ses` - **PAGO** (mais barato em volume)
- ✅ `mock` - **DEV ONLY** (só loga no console)

### **SMS Providers:**
- 🔜 `twilio` - **PAGO** (mais confiável)
- 🔜 `sns` - **PAGO** (AWS)
- ✅ `mock` - **GRATUITO** (só loga no console)

## ⚡ Trocar Provider (Super Fácil)

### **Arquivo:** `src/shared/config/notification.config.ts`
```typescript
export const NOTIFICATION_CONFIG = {
  PROVIDERS: {
    EMAIL: 'gmail',    // 🔄 TROQUE AQUI: 'gmail' | 'sendgrid' | 'ses'
    SMS: 'mock',       // 🔄 TROQUE AQUI: 'mock' | 'twilio' | 'sns'
  },
  // ... resto da config
}
```

## 🛠️ Como Implementar Novos Providers

### **1. Criar Provider de Email:**
```typescript
// src/workshop/4-infrastructure/providers/email/novo-provider.ts
export class NovoEmailProvider implements IEmailProvider {
  async sendEmail(data: EmailData): Promise<void> {
    // Sua implementação aqui
  }
}
```

### **2. Registrar no Factory:**
```typescript
// src/workshop/4-infrastructure/providers/notification-provider.factory.ts
case 'novo-provider':
  return new NovoEmailProvider();
```

### **3. Adicionar Configuração:**
```typescript
// src/shared/config/notification.config.ts
NOVO_PROVIDER: {
  API_KEY: process.env.NOVO_PROVIDER_KEY,
  // ... outras configs
}
```

## 📊 Status Atual

### **✅ FUNCIONANDO (GRÁTIS):**
- Email via Gmail SMTP
- Templates HTML responsivos  
- Logs detalhados
- Mock SMS (desenvolvimento)

### **🔜 PREPARADO PARA UPGRADE:**
- SendGrid (email profissional)
- AWS SES (email em massa)
- Twilio (SMS real)
- AWS SNS (SMS global)

## 🎯 Vantagens desta Arquitetura

1. **🔄 Troca Fácil**: Muda 1 linha de config
2. **💰 Econômico**: Começa gratuito, paga só quando necessário
3. **🧪 Testável**: Mock providers para desenvolvimento
4. **📈 Escalável**: Suporta providers enterprise
5. **🔒 Configurável**: Tudo via variáveis de ambiente