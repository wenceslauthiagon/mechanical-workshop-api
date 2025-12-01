# Sistema de Alertas e Lembretes - Documentação Completa

## 🔔 Funcionalidades de Alertas Implementadas

### 1. **Alertas Automáticos de Vacinas**
Cria lembretes automaticamente quando uma vacina tem próxima dose agendada.

**Endpoint:** `POST /api/reminders/vaccine-reminder`

**Request:**
```json
{
  "vaccineId": "uuid-da-vacina"
}
```

**Comportamento:**
- Cria lembrete 3 dias antes da próxima dose
- Vincula ao registro da vacina
- Título: "Vaccine: [nome da vacina]"
- Status: PENDING

---

### 2. **Alertas Automáticos de Medicamentos**
Cria lembretes para medicações com detecção inteligente do tipo.

**Endpoint:** `POST /api/reminders/medication-reminder`

**Request:**
```json
{
  "medicationId": "uuid-do-medicamento"
}
```

**Comportamento:**
- Detecta automaticamente o tipo:
  - `FLEA_TICK_CONTROL` → ReminderType.FLEA_TICK_TREATMENT
  - `DEWORMER` → ReminderType.DEWORMING
  - Outros → ReminderType.MEDICATION
- Inclui dosagem e instruções na descrição
- Usa a data de início como data do lembrete

---

### 3. **Agendar Passeios Recorrentes** 🆕
Cria múltiplos lembretes para passeios com frequência configurável.

**Endpoint:** `POST /api/reminders/schedule-walks`

**Request - Passeios Diários:**
```json
{
  "petId": "uuid-do-pet",
  "frequency": "DAILY",
  "time": "07:00",
  "title": "Passeio Matinal",
  "description": "Passeio no parque"
}
```

**Request - Passeios Semanais (específicos dias):**
```json
{
  "petId": "uuid-do-pet",
  "frequency": "WEEKLY",
  "time": "18:00",
  "daysOfWeek": [1, 3, 5],
  "title": "Passeio Noturno",
  "description": "Segunda, Quarta e Sexta"
}
```
*Dias da semana: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado*

**Request - Datas Customizadas:**
```json
{
  "petId": "uuid-do-pet",
  "frequency": "CUSTOM",
  "time": "16:00",
  "customDates": [
    "2025-11-10T00:00:00.000Z",
    "2025-11-15T00:00:00.000Z",
    "2025-11-20T00:00:00.000Z"
  ],
  "title": "Passeios Especiais"
}
```

**Comportamento:**
- **DAILY**: Cria 30 lembretes (próximos 30 dias)
- **WEEKLY**: Cria lembretes para 12 semanas
- **CUSTOM**: Cria lembretes nas datas especificadas

---

### 4. **Consultar Lembretes com Filtros** 🆕
Busca avançada de lembretes com múltiplos filtros.

**Endpoint:** `GET /api/reminders/pet/:petId/filter`

**Query Parameters:**
- `type` - Tipo do lembrete (VACCINE, MEDICATION, WALK, etc.)
- `status` - Status (PENDING, SENT, COMPLETED, CANCELED)
- `startDate` - Data inicial (ISO 8601)
- `endDate` - Data final (ISO 8601)

**Exemplos:**

```bash
# Apenas lembretes de passeios pendentes
GET /api/reminders/pet/abc123/filter?type=WALK&status=PENDING

# Lembretes do próximo mês
GET /api/reminders/pet/abc123/filter?startDate=2025-12-01&endDate=2025-12-31

# Vacinas pendentes do próximo trimestre
GET /api/reminders/pet/abc123/filter?type=VACCINE&status=PENDING&startDate=2025-12-01&endDate=2026-02-28
```

---

## 📋 Tipos de Lembretes Disponíveis

| Tipo | Descrição | Uso |
|------|-----------|-----|
| `VACCINE` | Vacinas | Alertas de doses |
| `MEDICATION` | Medicamentos gerais | Antibióticos, anti-inflamatórios |
| `VETERINARY_VISIT` | Consultas veterinárias | Check-ups, retornos |
| `DEWORMING` | Vermifugação | Vermífugos |
| `FLEA_TICK_TREATMENT` | Antipulgas/carrapatos | Controle de parasitas externos |
| `WEIGHT_CHECK` | Pesagem | Monitoramento de peso |
| `GROOMING` | Banho e tosa | Higiene |
| `WALK` 🆕 | Passeios | Exercícios diários |
| `EXERCISE` 🆕 | Exercícios | Atividades físicas |
| `OTHER` | Outros | Customizado |

---

## 🔄 Endpoints Completos de Lembretes

### Lembretes Gerais
- `POST /api/reminders` - Criar lembrete manual
- `GET /api/reminders/upcoming?daysAhead=7` - Próximos lembretes
- `GET /api/reminders/overdue` - Lembretes atrasados
- `GET /api/reminders/pet/:petId` - Todos os lembretes do pet
- `GET /api/reminders/pet/:petId/filter` - Busca com filtros 🆕
- `PATCH /api/reminders/:id/complete` - Marcar como concluído

### Alertas Automáticos 🆕
- `POST /api/reminders/vaccine-reminder` - Criar alerta de vacina
- `POST /api/reminders/medication-reminder` - Criar alerta de medicamento
- `POST /api/reminders/schedule-walks` - Agendar passeios recorrentes

---

## 💡 Exemplos de Uso Completos

### Fluxo 1: Cadastrar Vacina com Alerta Automático

```bash
# 1. Cadastrar vacina
POST /api/vaccines
{
  "petId": "abc123",
  "name": "V10",
  "scheduledDate": "2025-12-01",
  "nextDoseDate": "2026-01-01",
  "status": "SCHEDULED"
}
# Resposta: { "id": "vaccine-xyz" }

# 2. Criar alerta automático
POST /api/reminders/vaccine-reminder
{
  "vaccineId": "vaccine-xyz"
}
# Cria lembrete para 2025-12-29 (3 dias antes)
```

### Fluxo 2: Medicação Antipulgas com Alerta

```bash
# 1. Cadastrar medicamento
POST /api/medications
{
  "petId": "abc123",
  "name": "Bravecto",
  "type": "FLEA_TICK_CONTROL",
  "dosage": "1 comprimido",
  "frequency": "MONTHLY",
  "startDate": "2025-12-01",
  "reason": "Controle de pulgas e carrapatos"
}
# Resposta: { "id": "med-xyz" }

# 2. Criar alerta
POST /api/reminders/medication-reminder
{
  "medicationId": "med-xyz"
}
# Tipo detectado automaticamente: FLEA_TICK_TREATMENT
```

### Fluxo 3: Agendar Passeios da Semana

```bash
POST /api/reminders/schedule-walks
{
  "petId": "abc123",
  "frequency": "WEEKLY",
  "time": "07:00",
  "daysOfWeek": [1, 2, 3, 4, 5],
  "title": "Passeio Matinal de Segunda a Sexta"
}
# Cria ~60 lembretes (12 semanas × 5 dias)
```

### Fluxo 4: Consultar Próximos Passeios

```bash
# Ver passeios dos próximos 7 dias
GET /api/reminders/pet/abc123/filter?type=WALK&status=PENDING&startDate=2025-12-01&endDate=2025-12-07

# Resposta:
[
  {
    "id": "rem-1",
    "type": "WALK",
    "title": "Passeio Matinal de Segunda a Sexta",
    "dueDate": "2025-12-02T07:00:00.000Z",
    "status": "PENDING"
  },
  {
    "id": "rem-2",
    "type": "WALK",
    "title": "Passeio Matinal de Segunda a Sexta",
    "dueDate": "2025-12-03T07:00:00.000Z",
    "status": "PENDING"
  }
]
```

---

## 🎯 Status do Lembrete

- **PENDING** - Aguardando execução
- **SENT** - Notificação enviada
- **COMPLETED** - Concluído pelo usuário
- **CANCELED** - Cancelado

---

## 🔧 Integrações Futuras Sugeridas

1. **Notificações Push** - Enviar para o app Android
2. **Notificações por Email** - Alertas por email
3. **WhatsApp** - Integração com WhatsApp Business API
4. **Google Calendar** - Sincronizar com calendário
5. **Recorrência Inteligente** - Ajustar automaticamente baseado em histórico
6. **Lembretes Baseados em Localização** - Alertar quando próximo ao veterinário
