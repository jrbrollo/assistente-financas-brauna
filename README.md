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
  - "Deletar último" - Remove a última transação registrada
  - "Categorias" - Lista todas as categorias disponíveis
- ✉️ Confirmações automáticas após registro
- 💬 Mensagem de ajuda com "ajuda" ou "oi"

### Dashboard Web
- 🔐 Autenticação por telefone
- 📋 Lista completa de transações
- ✏️ **NOVO**: Editar transações existentes
- 🗑️ **NOVO**: Deletar transações com confirmação
- 📊 Gráficos interativos (pizza e barra)
- 🔍 Filtros por período (semana/mês/todos)
- 📂 **NOVO**: Filtro por categoria
- 📥 **NOVO**: Exportar transações para CSV
- 📈 Cards de resumo (total, transações, média)

### API REST Completa
- `GET /api/transactions` - Listar transações com filtros
- `POST /api/transactions` - Criar nova transação
- `GET /api/transactions/[id]` - Obter transação específica
- `PATCH /api/transactions/[id]` - Atualizar transação
- `DELETE /api/transactions/[id]` - Deletar transação
- `GET /api/transactions/export` - Exportar para CSV

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
- **Database**: Firebase Firestore (NoSQL)
- **WhatsApp**: Evolution API
- **IA**: OpenAI GPT-4o-mini (custo-eficiente, 20-25x mais barato que Claude)
- **Gráficos**: Recharts
- **Deploy**: Vercel

### Por que OpenAI GPT-4o-mini?

Migração estratégica de Claude 3.5 Sonnet para GPT-4o-mini:

**Comparação de custos (por 1M tokens):**
- **GPT-4o-mini**: $0.15 (input) / $0.60 (output) ✅
- Claude 3.5 Sonnet: $3.00 (input) / $15.00 (output)

**Economia:** ~95% no custo de IA 💰

Para 1000 mensagens/dia:
- GPT-4o-mini: ~$2-3/mês
- Claude: ~$40-60/mês

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no Firebase (plano gratuito Spark)
- Evolution API configurada (WhatsApp)
- **API Key da OpenAI** (GPT-4o-mini)
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

### 3. Configure o Firebase

#### 3.1. Crie um projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: "assistente-financas")
4. Desabilite Google Analytics (opcional para MVP)
5. Clique em "Criar projeto"

#### 3.2. Configure o Firestore

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de produção"
4. Escolha uma localização (ex: "southamerica-east1" para São Paulo)

#### 3.3. Configure as regras de segurança

1. No Firestore, vá em "Regras"
2. Cole o conteúdo de `firebase/firestore.rules`
3. Clique em "Publicar"

#### 3.4. Crie índices compostos

1. No Firestore, vá em "Índices"
2. Crie os seguintes índices compostos manualmente:
   - Collection: `transactions`
   - Fields: `user_id` (ASC), `data` (DESC)

Ou importe o arquivo `firebase/firestore.indexes.json` usando o Firebase CLI.

#### 3.5. Obtenha as credenciais Web

1. Vá em "Configurações do projeto" (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique no ícone web "</>"
4. Registre um aplicativo (ex: "assistente-financas-web")
5. Copie as configurações do Firebase

#### 3.6. Obtenha as credenciais do Service Account

1. Vá em "Configurações do projeto" > "Contas de serviço"
2. Clique em "Gerar nova chave privada"
3. Salve o arquivo JSON (não compartilhe!)

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
# Firebase (das configurações web)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123

# Firebase Admin (do arquivo JSON da service account)
FIREBASE_ADMIN_PROJECT_ID=seu-projeto
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave aqui\n-----END PRIVATE KEY-----\n"

# OpenAI API (Recomendado - Custo-eficiente)
OPENAI_API_KEY=sk-proj-...

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE_NAME=assistente-financas

# Outros
WEBHOOK_SECRET=qualquer-string-aleatoria
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Obtenha sua OpenAI API Key

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Crie uma conta (se não tiver)
3. Vá em "API Keys"
4. Clique em "Create new secret key"
5. Copie a chave (você não poderá vê-la novamente!)
6. Cole no `.env` na variável `OPENAI_API_KEY`

### 6. Inicialize o Firebase

Execute o script para criar as categorias padrão:

```bash
npx ts-node scripts/init-firebase.ts
```

### 7. Configure o Evolution API (WhatsApp)

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
    "instanceName": "assistente-financas",
    "qrcode": true
  }'

# Conecte ao WhatsApp escaneando o QR Code
```

#### Configure o Webhook:

```bash
curl -X POST http://localhost:8080/webhook/set/assistente-financas \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-dominio.com/api/webhook/whatsapp",
    "events": ["MESSAGES_UPSERT"]
  }'
```

### 8. Execute o projeto

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

Acesse: http://localhost:3000

## 🧪 Testes

Execute o script de testes end-to-end:

```bash
npx ts-node scripts/test-app.ts
```

Este script testa:
- ✅ Processamento de IA
- ✅ CRUD do Firestore
- ✅ Categorias
- ✅ Validações
- ✅ Mensagens inválidas

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
   Academia 150
   Jantar romântico 200 reais
   ```

2. **Consultar gastos:**
   ```
   Gastos da semana
   Gastos do mês
   Resumo
   ```

3. **Gerenciar transações:**
   ```
   Deletar último       # Remove a última transação
   Categorias          # Lista categorias disponíveis
   ```

4. **Obter ajuda:**
   ```
   ajuda
   oi
   ```

### Para Planejadores (Dashboard)

1. Acesse: `https://seu-app.com/login`
2. Entre com o telefone cadastrado
3. Visualize gráficos e transações
4. **Edite** transações clicando no ícone de lápis
5. **Delete** transações clicando no ícone de lixeira
6. **Filtre** por período (semana/mês/todos) e categoria
7. **Exporte** para CSV clicando no botão "Exportar CSV"

## 🗂️ Estrutura do Projeto

```
assistente-financas-brauna/
├── app/
│   ├── api/
│   │   ├── transactions/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # GET, PATCH, DELETE transação
│   │   │   ├── export/
│   │   │   │   └── route.ts      # Exportar CSV
│   │   │   └── route.ts          # GET, POST transações
│   │   └── webhook/
│   │       └── whatsapp/
│   │           └── route.ts      # Webhook do WhatsApp
│   ├── dashboard/                # Dashboard principal
│   ├── login/                    # Página de login
│   ├── layout.tsx                # Layout global
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Estilos globais
├── components/
│   ├── ExpenseChart.tsx          # Gráficos de gastos
│   ├── TransactionList.tsx       # Lista de transações
│   ├── EditTransactionModal.tsx  # Modal de edição
│   └── DeleteConfirmModal.tsx    # Modal de confirmação
├── lib/
│   ├── ai/
│   │   ├── openai.ts             # Integração OpenAI API
│   │   └── claude.ts             # Integração Claude API (legacy)
│   ├── firebase/
│   │   ├── client.ts             # Cliente Firebase (browser)
│   │   ├── admin.ts              # Cliente Firebase Admin (servidor)
│   │   └── firestore-utils.ts    # Utilities do Firestore
│   └── auth.ts                   # Utilities de autenticação
├── firebase/
│   ├── firestore.rules           # Regras de segurança
│   └── firestore.indexes.json    # Índices compostos
├── scripts/
│   ├── init-firebase.ts          # Script de inicialização
│   └── test-app.ts               # Script de testes E2E
├── types/
│   └── index.ts                  # TypeScript types (expandidos)
├── .env.example                  # Exemplo de variáveis
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔒 Segurança

- Regras de segurança do Firestore
- Validação de webhooks
- Autenticação por telefone
- Variáveis de ambiente para secrets
- Firebase Admin SDK apenas no servidor
- TypeScript estrito para type-safety
- Validações de entrada em todas as APIs

## 💰 Custos Estimados

### Firebase (Plano Gratuito Spark)

O Firebase oferece um plano gratuito muito generoso:

- **Firestore**: 50.000 leituras/dia, 20.000 escritas/dia, 20.000 exclusões/dia
- **Armazenamento**: 1 GB
- **Transfer:** 10 GB/mês

Para um MVP com até ~50 usuários ativos por dia, o plano gratuito é suficiente!

### OpenAI GPT-4o-mini

**Estimativa para 1000 mensagens/dia:**

- Entrada: ~100 tokens/mensagem = 100.000 tokens/dia = 3M tokens/mês
- Saída: ~50 tokens/mensagem = 50.000 tokens/dia = 1.5M tokens/mês

**Custo mensal:**
- Entrada: 3M × $0.15/1M = $0.45
- Saída: 1.5M × $0.60/1M = $0.90
- **Total: ~$1.35/mês** 🎉

**Comparação com Claude 3.5 Sonnet:**
- Claude: ~$54/mês para o mesmo volume
- **Economia: 97.5%**

### Total Estimado
- Firebase: **$0** (plano gratuito)
- OpenAI: **~$1-3/mês**
- Evolution API: **Grátis** (self-hosted)
- Vercel: **$0** (plano hobby)

**Custo total: ~$1-3/mês** para até 1000 mensagens/dia! 🚀

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

- Verifique se a OpenAI API Key está correta
- Verifique os logs no console (aparecerá o erro específico)
- Teste com mensagens mais claras
- Verifique se tem créditos na conta OpenAI

### Erro "Missing or insufficient permissions" no Firestore

- Confirme que as regras de segurança estão configuradas
- Verifique se o Firebase Admin está inicializado corretamente
- Verifique se as credenciais do service account estão corretas

### Erro nos índices compostos

- Crie os índices manualmente no Firebase Console
- Ou use o Firebase CLI para implantar: `firebase deploy --only firestore:indexes`

### Build falha com erro Firebase

- Se o build falhar com "invalid-api-key", é normal!
- Isso acontece porque Next.js tenta coletar dados das páginas durante o build
- O código está correto, você só precisa de chaves Firebase válidas no deploy

## 📊 Exemplos de Mensagens

### Registrar Gastos
```
✅ "Gastei 50 reais no almoço"
✅ "Paguei 120 de uber hoje"
✅ "Comprei remédio na farmácia, 85 reais"
✅ "Mensalidade da academia 150"
✅ "Pizza 45 reais"
✅ "Jantar romântico 200"
```

### Consultas e Comandos
```
✅ "Gastos da semana"
✅ "Gastos do mês"
✅ "Resumo"
✅ "Deletar último"
✅ "Categorias"
✅ "ajuda"
```

### Mensagens Inválidas (Serão Rejeitadas)
```
❌ "Oi, tudo bem?"
❌ "Como você está?"
❌ "abcdef"
❌ "123"
```

## 🎯 Roadmap (Próximas Funcionalidades)

Funcionalidades implementadas recentemente:
- [x] CRUD completo de transações via API
- [x] Edição de transações no dashboard
- [x] Exclusão de transações no dashboard
- [x] Filtros avançados por categoria
- [x] Exportação para CSV
- [x] Comando WhatsApp "deletar último"
- [x] Comando WhatsApp "categorias"
- [x] Script de testes end-to-end
- [x] Migração para OpenAI (redução de custos)

Próximas funcionalidades:
- [ ] Envio de comprovantes (imagens)
- [ ] OCR para extrair dados de notas fiscais
- [ ] Metas de gastos por categoria
- [ ] Notificações de alertas
- [ ] Relatórios PDF mensais
- [ ] Multi-usuário para famílias
- [ ] Integração com Open Banking
- [ ] App mobile (React Native)
- [ ] Firebase Auth completo (SMS, Email)
- [ ] Receitas (não apenas gastos)
- [ ] Categorias customizadas por usuário

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

**Desenvolvido com ❤️ usando Firebase e OpenAI**
