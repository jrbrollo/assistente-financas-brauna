# 🚀 Guia Rápido - Firebase Edition

## Início Rápido (10 minutos)

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure o Firebase

#### Criar projeto Firebase (2 minutos)

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome (ex: "assistente-financas")
4. Desabilite Google Analytics
5. Clique em "Criar projeto"

#### Configure o Firestore (1 minuto)

1. Menu lateral > "Firestore Database"
2. "Criar banco de dados"
3. "Iniciar no modo de produção"
4. Escolha localização: "southamerica-east1" (São Paulo)

#### Obter credenciais (3 minutos)

**Credenciais Web:**
1. Configurações do projeto (engrenagem)
2. "Seus aplicativos" > Ícone web "</>"
3. Registre o app
4. Copie as configurações

**Service Account:**
1. Configurações > "Contas de serviço"
2. "Gerar nova chave privada"
3. Salve o JSON

### 3. Configure a API da Anthropic

1. Acesse [Anthropic Console](https://console.anthropic.com)
2. Gere uma API key
3. Copie a key (sk-ant-...)

### 4. Configure o .env

```bash
cp .env.example .env
```

Edite com suas credenciais:

```env
# Firebase (do passo 2)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc

# Firebase Admin (do JSON)
FIREBASE_ADMIN_PROJECT_ID=seu-projeto
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@...iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave\n-----END PRIVATE KEY-----\n"

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Evolution API (opcional por enquanto)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=seu-key
EVOLUTION_INSTANCE_NAME=assistente-financas
```

### 5. Inicialize o Firebase

```bash
npx ts-node scripts/init-firebase.ts
```

Isso cria as 9 categorias padrão no Firestore.

### 6. Configure as regras de segurança

1. No Firebase Console, vá em "Firestore Database" > "Regras"
2. Cole o conteúdo de `firebase/firestore.rules`
3. Clique em "Publicar"

### 7. Crie os índices compostos

No Firebase Console, vá em "Firestore Database" > "Índices" e crie:

- **Collection**: `transactions`
- **Fields**:
  - `user_id` (Ascending)
  - `data` (Descending)

Clique em "Criar índice" (leva ~2 minutos)

### 8. Execute o projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

## 🧪 Testando sem WhatsApp

### Criar um usuário de teste manualmente

No Firebase Console, vá em "Firestore Database" e:

1. Clique em "Iniciar coleção"
2. ID da coleção: `users`
3. ID do documento: (gerar automático)
4. Campos:
   ```
   nome: "Teste User"
   telefone: "11999999999"
   created_at: timestamp atual
   ```
5. Salvar

### Criar uma transação de teste

1. Coleção: `transactions`
2. Campos:
   ```
   user_id: "[ID do usuário criado acima]"
   valor: 50
   categoria: "Alimentação"
   descricao: "Almoço"
   data: "2025-11-18"
   created_at: timestamp atual
   ```

### Fazer login no dashboard

1. Acesse http://localhost:3000/login
2. Digite: `11999999999`
3. Clique em "Entrar"

Você verá as transações e gráficos! 🎉

## 📱 Configurar WhatsApp (Opcional)

### Docker (Local)

```bash
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
docker-compose up -d
```

### Criar instância

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: sua-key" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "assistente-financas",
    "qrcode": true
  }'
```

Escaneie o QR Code com WhatsApp Business.

### Configurar webhook

```bash
curl -X POST http://localhost:8080/webhook/set/assistente-financas \
  -H "apikey: sua-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/api/webhook/whatsapp",
    "events": ["MESSAGES_UPSERT"]
  }'
```

Pronto! Agora envie: **"Gastei 50 reais no almoço"** no WhatsApp.

## 🔥 Por que Firebase?

### Vantagens sobre Supabase:

✅ **Plano Gratuito Ilimitado**: Não há limite de 2 projetos
✅ **50.000 leituras/dia grátis**: Suporta ~50 usuários ativos
✅ **NoSQL simples**: Mais fácil para MVP
✅ **Escalável**: Fácil upgrade quando crescer
✅ **SDKs oficiais**: Melhor suporte e documentação

### Limites Gratuitos:

- 50.000 leituras/dia
- 20.000 escritas/dia
- 20.000 exclusões/dia
- 1 GB de armazenamento
- 10 GB de transferência/mês

**Ideal para MVP!** 💪

## 🐛 Problemas Comuns

### "Missing or insufficient permissions"

→ Configure as regras de segurança (passo 6)

### "indexes required"

→ Crie os índices compostos (passo 7)
→ Ou espere 2 minutos para construção automática

### Erro no Firebase Admin

→ Verifique a private key no .env
→ Certifique-se que tem `\n` preservados

### IA não categoriza

→ Verifique ANTHROPIC_API_KEY no .env
→ Teste com mensagens mais claras

## 📊 Estrutura do Firestore

```
📁 users/
  └── {userId}
      ├── nome: string
      ├── telefone: string
      └── created_at: timestamp

📁 transactions/
  └── {transactionId}
      ├── user_id: string
      ├── valor: number
      ├── categoria: string
      ├── descricao: string
      ├── data: string (YYYY-MM-DD)
      ├── created_at: timestamp
      └── updated_at: timestamp

📁 categories/
  └── {categoryId}
      ├── nome: string
      ├── cor: string (#HEX)
      ├── icon: string (emoji)
      └── created_at: timestamp
```

## 🚀 Deploy na Vercel

```bash
# 1. Push para GitHub
git push

# 2. Conecte na Vercel
# 3. Configure as mesmas variáveis do .env
# 4. Deploy!
```

Depois atualize o webhook do Evolution API com a URL da Vercel.

## 💡 Dicas

- Use o Firebase Emulator para desenvolvimento local
- Monitore uso no Firebase Console > "Usage"
- Crie backups regulares das collections
- Configure alertas de quota no Firebase

---

**Pronto para começar! 🎉**

Dúvidas? Veja o README.md completo.
