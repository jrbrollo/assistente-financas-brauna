# 🚀 Guia Rápido de Desenvolvimento

## Início Rápido (5 minutos)

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure o Supabase

1. Crie uma conta em [https://supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o arquivo `supabase/schema.sql`
4. Copie as credenciais:
   - Vá em **Settings > API**
   - Copie a `URL` e a `anon/public key`
   - Copie a `service_role key` (secreta!)

### 3. Configure a API da Anthropic

1. Crie uma conta em [https://console.anthropic.com](https://console.anthropic.com)
2. Gere uma API key
3. Copie a key (começa com `sk-ant-...`)

### 4. Configure o arquivo .env

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Claude API (obrigatório)
ANTHROPIC_API_KEY=sk-ant-...

# Evolution API (opcional para testar sem WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE_NAME=assistente-financas

# Outros
WEBHOOK_SECRET=qualquer-string-aleatoria
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🧪 Testando sem WhatsApp

Você pode testar o sistema diretamente inserindo dados no banco:

### Criar um usuário de teste

No Supabase SQL Editor:

```sql
INSERT INTO users (nome, telefone, email)
VALUES ('Usuário Teste', '11999999999', 'teste@exemplo.com');
```

### Testar o processamento de IA

Crie um arquivo de teste `test-ai.ts`:

```typescript
import { processExpenseMessage } from './lib/ai/claude'

async function test() {
  const result = await processExpenseMessage('Gastei 50 reais no almoço')
  console.log(result)
}

test()
```

Execute:

```bash
npx ts-node test-ai.ts
```

## 📱 Configurar Evolution API (WhatsApp)

### Opção 1: Docker (Recomendado)

```bash
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
cp .env.example .env
docker-compose up -d
```

Acesse: http://localhost:8080

### Opção 2: Cloud (Mais fácil)

Use um serviço de hospedagem do Evolution API:
- [evolution-api.com](https://evolution-api.com)
- Railway
- Render

### Configurar instância

1. Crie uma instância via API:

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "assistente-financas",
    "qrcode": true
  }'
```

2. Escaneie o QR Code com WhatsApp Business

3. Configure o webhook:

```bash
curl -X POST http://localhost:8080/webhook/set/assistente-financas \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/api/webhook/whatsapp",
    "events": ["MESSAGES_UPSERT"]
  }'
```

## 🔧 Desenvolvimento

### Estrutura de pastas

```
app/
├── api/webhook/whatsapp/  → Recebe mensagens do WhatsApp
├── dashboard/             → Dashboard principal
├── login/                 → Autenticação
└── page.tsx              → Landing page

components/
├── ExpenseChart.tsx      → Gráficos
└── TransactionList.tsx   → Lista de transações

lib/
├── ai/claude.ts         → Processamento IA
├── supabase/client.ts   → Cliente do banco
└── auth.ts              → Autenticação
```

### Adicionar nova categoria

1. No banco Supabase:

```sql
INSERT INTO categories (nome, cor, icon)
VALUES ('Nova Categoria', '#FF5733', '🎨');
```

2. Atualizar constante em `lib/ai/claude.ts`:

```typescript
const CATEGORIAS = [
  'Alimentação',
  'Transporte',
  // ...
  'Nova Categoria'  // Adicionar aqui
]
```

### Personalizar prompts da IA

Edite o arquivo `lib/ai/claude.ts`:

```typescript
const SYSTEM_PROMPT = `
  Seu prompt personalizado aqui...
`
```

## 🧪 Scripts úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Linter
npm run lint

# TypeScript check
npx tsc --noEmit
```

## 🐛 Debug

### Ver logs do webhook

```bash
# No terminal do Next.js, você verá:
# "Mensagem recebida de 11999999999: Gastei 50 no almoço"
```

### Testar webhook manualmente

```bash
curl -X POST http://localhost:3000/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "test123"
      },
      "pushName": "Teste",
      "message": {
        "conversation": "Gastei 50 reais no almoço"
      }
    }
  }'
```

### Verificar banco de dados

No Supabase Dashboard > Table Editor:
- Visualize `users`
- Visualize `transactions`
- Visualize `categories`

## 📊 Exemplos de Testes

### 1. Testar registro de gasto

Envie no WhatsApp:
```
Gastei 50 reais no almoço
```

Deve responder:
```
✅ Gasto registrado!

💰 Valor: R$ 50.00
📂 Categoria: Alimentação
📝 Descrição: Almoço
📅 Data: 18/11/2025
```

### 2. Testar consulta

Envie no WhatsApp:
```
gastos do mês
```

Deve responder com resumo do mês.

### 3. Testar dashboard

1. Acesse http://localhost:3000/login
2. Digite o telefone: `11999999999`
3. Veja os gastos e gráficos

## 🚀 Deploy Rápido (Vercel)

```bash
# 1. Instale a CLI da Vercel
npm i -g vercel

# 2. Deploy
vercel

# 3. Configure as variáveis de ambiente no painel
# 4. Atualize o webhook do Evolution API com a nova URL
```

## 💡 Dicas

- Use `console.log` nos arquivos da pasta `app/api` para debug
- Teste com mensagens variadas para treinar a IA
- Use ngrok para testar webhooks localmente: `ngrok http 3000`
- Mantenha a API key da Anthropic privada
- Use o service role do Supabase apenas no servidor

## ❓ Problemas Comuns

### "Erro ao processar mensagem"
- Verifique a API key da Anthropic
- Veja os logs do console

### "Usuário não encontrado"
- Envie uma mensagem pelo WhatsApp primeiro
- Ou crie manualmente no banco

### "Webhook não recebe mensagens"
- Verifique se o Evolution API está rodando
- Confirme a URL do webhook
- Use ngrok para testes locais

---

**Pronto para começar! 🎉**
