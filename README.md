# 💰 Assistente Financeiro Braúna

Sistema de controle de gastos pessoais via WhatsApp com IA, desenvolvido para escritórios de planejamento financeiro.

## 🚀 Funcionalidades

### WhatsApp Bot
- ✅ Receber mensagens de texto sobre gastos
- 🤖 IA extrai automaticamente: valor, categoria, descrição e data
- 📊 Comandos de consulta:
  - "Gastos da semana"
  - "Gastos do mês"
  - "Resumo"
- ✉️ Confirmações automáticas após registro
- 💬 Mensagem de ajuda com "ajuda" ou "oi"

### Dashboard Web
- 🔐 Autenticação por telefone
- 📋 Lista completa de transações
- 📊 Gráficos interativos (pizza e barra)
- 🔍 Filtros por período (semana/mês/todos)
- 📈 Cards de resumo (total, transações, média)

### Categorias Automáticas
- 🍔 Alimentação
- 🚗 Transporte
- 🏠 Moradia
- ⚕️ Saúde
- 🎉 Lazer
- 💰 Investimentos
- 📚 Educação
- 🛍️ Compras
- 📦 Outros

## 🛠️ Stack Tecnológica

- **Frontend/Backend**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **WhatsApp**: Evolution API
- **IA**: Claude 3.5 Sonnet (Anthropic)
- **Gráficos**: Recharts
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase
- Evolution API configurada (WhatsApp)
- API Key da Anthropic (Claude)
- Git

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd assistente-financas-brauna
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE_NAME=nome-da-instancia

# Webhook Secret
WEBHOOK_SECRET=seu-secret-aleatorio

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure o banco de dados

No painel do Supabase, vá em **SQL Editor** e execute o script:

```bash
supabase/schema.sql
```

Isso criará:
- Tabelas: `users`, `transactions`, `categories`
- Índices para performance
- Row Level Security (RLS)
- Views para estatísticas
- Categorias padrão

### 5. Configure o Evolution API

#### Instalação local (Docker):

```bash
# Clone o Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Configure as variáveis
cp .env.example .env

# Inicie com Docker
docker-compose up -d
```

#### Configure a instância:

```bash
# Crie uma instância
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "nome-da-instancia",
    "qrcode": true
  }'

# Conecte ao WhatsApp escaneando o QR Code
```

#### Configure o Webhook:

```bash
curl -X POST http://localhost:8080/webhook/set/nome-da-instancia \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-dominio.com/api/webhook/whatsapp",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT"
    ]
  }'
```

### 6. Execute o projeto

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

Acesse: http://localhost:3000

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

### Configuração importante:

- Configure o webhook do Evolution API com a URL de produção:
  ```
  https://seu-app.vercel.app/api/webhook/whatsapp
  ```

## 📱 Como Usar

### Para Clientes (WhatsApp)

1. **Registrar um gasto:**
   ```
   Gastei 50 reais no almoço
   Paguei 120 de uber
   Comprei remédio, 85 reais
   ```

2. **Consultar gastos:**
   ```
   Gastos da semana
   Gastos do mês
   Resumo
   ```

3. **Obter ajuda:**
   ```
   ajuda
   oi
   ```

### Para Planejadores (Dashboard)

1. Acesse: `https://seu-app.com/login`
2. Entre com o telefone cadastrado
3. Visualize gráficos e transações
4. Filtre por período

## 🗂️ Estrutura do Projeto

```
assistente-financas-brauna/
├── app/
│   ├── api/
│   │   └── webhook/
│   │       └── whatsapp/       # Webhook do WhatsApp
│   ├── dashboard/              # Dashboard principal
│   ├── login/                  # Página de login
│   ├── layout.tsx              # Layout global
│   ├── page.tsx                # Landing page
│   └── globals.css             # Estilos globais
├── components/
│   ├── ExpenseChart.tsx        # Gráficos de gastos
│   └── TransactionList.tsx     # Lista de transações
├── lib/
│   ├── ai/
│   │   └── claude.ts           # Integração Claude API
│   ├── supabase/
│   │   └── client.ts           # Cliente Supabase
│   └── auth.ts                 # Utilities de autenticação
├── supabase/
│   └── schema.sql              # Schema do banco
├── types/
│   └── index.ts                # TypeScript types
├── .env.example                # Exemplo de variáveis
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔒 Segurança

- Row Level Security (RLS) no Supabase
- Validação de webhooks
- Autenticação por telefone
- Variáveis de ambiente para secrets
- Service role apenas no servidor

## 🐛 Troubleshooting

### Webhook não está recebendo mensagens

1. Verifique se o Evolution API está rodando
2. Confirme que o webhook está configurado corretamente
3. Use ngrok para testar localmente:
   ```bash
   ngrok http 3000
   # Use a URL do ngrok no webhook
   ```

### IA não está categorizando corretamente

- Verifique se a API Key da Anthropic está correta
- Verifique os logs no console
- Teste com mensagens mais claras

### Erro de autenticação no Supabase

- Confirme que as políticas RLS estão ativas
- Verifique se as variáveis de ambiente estão corretas
- Use o service role key para webhooks

## 📊 Exemplos de Mensagens

### Registrar Gastos
```
✅ "Gastei 50 reais no almoço"
✅ "Paguei 120 de uber hoje"
✅ "Comprei remédio na farmácia, 85 reais"
✅ "Mensalidade da academia 150"
✅ "Pizza 45 reais"
```

### Consultas
```
✅ "Gastos da semana"
✅ "Gastos do mês"
✅ "Resumo"
✅ "ajuda"
```

## 🎯 Roadmap (Próximas Funcionalidades)

- [ ] Envio de comprovantes (imagens)
- [ ] OCR para extrair dados de notas fiscais
- [ ] Metas de gastos por categoria
- [ ] Notificações de alertas
- [ ] Relatórios PDF mensais
- [ ] Multi-usuário para famílias
- [ ] Integração com Open Banking
- [ ] App mobile (React Native)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- Braúna Planejamento Financeiro

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Email: suporte@exemplo.com

---

**Desenvolvido com ❤️ por Braúna Planejamento Financeiro**
