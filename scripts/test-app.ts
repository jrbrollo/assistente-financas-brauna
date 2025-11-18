/**
 * Script de Teste End-to-End
 *
 * Testa todas as funcionalidades principais do app:
 * - Processamento de IA
 * - Criação de usuário
 * - Criação de transação
 * - Consultas
 * - Atualização
 * - Exclusão
 *
 * Execute: npx ts-node scripts/test-app.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { processExpenseMessage } from '../lib/ai/openai'

// Configurar Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message: string) {
  log(`✅ ${message}`, 'green')
}

function error(message: string) {
  log(`❌ ${message}`, 'red')
}

function info(message: string) {
  log(`ℹ️  ${message}`, 'cyan')
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testAI() {
  log('\n🤖 TESTE 1: Processamento de IA', 'blue')
  log('═'.repeat(50), 'blue')

  const testMessages = [
    'Gastei 50 reais no almoço',
    'Paguei 120 de uber',
    'Comprei remédio, 85 reais',
    'Academia 150',
    'Jantar romântico 200 reais'
  ]

  for (const msg of testMessages) {
    try {
      info(`Processando: "${msg}"`)
      const result = await processExpenseMessage(msg)

      if ('error' in result) {
        error(`Falhou: ${result.error}`)
      } else {
        success(`OK → Valor: R$ ${result.valor} | Categoria: ${result.categoria} | Descrição: ${result.descricao}`)
      }

      await sleep(500)
    } catch (err: any) {
      error(`Erro: ${err.message}`)
    }
  }
}

async function testFirestore() {
  log('\n🔥 TESTE 2: Firestore CRUD', 'blue')
  log('═'.repeat(50), 'blue')

  try {
    // Criar usuário de teste
    info('Criando usuário de teste...')
    const userRef = await db.collection('users').add({
      nome: 'Teste User',
      telefone: '99999999999',
      created_at: new Date(),
    })
    success(`Usuário criado: ${userRef.id}`)

    // Criar transação
    info('Criando transação...')
    const transactionRef = await db.collection('transactions').add({
      user_id: userRef.id,
      valor: 100,
      categoria: 'Alimentação',
      descricao: 'Teste de almoço',
      data: '2025-11-18',
      created_at: new Date(),
    })
    success(`Transação criada: ${transactionRef.id}`)

    // Ler transação
    info('Lendo transação...')
    const transactionDoc = await transactionRef.get()
    if (transactionDoc.exists) {
      success('Transação lida com sucesso')
    } else {
      error('Transação não encontrada')
    }

    // Atualizar transação
    info('Atualizando transação...')
    await transactionRef.update({
      valor: 150,
      updated_at: new Date(),
    })
    success('Transação atualizada')

    // Consultar transações do usuário
    info('Consultando transações do usuário...')
    const querySnapshot = await db
      .collection('transactions')
      .where('user_id', '==', userRef.id)
      .get()
    success(`Encontradas ${querySnapshot.size} transações`)

    // Limpar dados de teste
    info('Limpando dados de teste...')
    await transactionRef.delete()
    await userRef.delete()
    success('Dados de teste removidos')

  } catch (err: any) {
    error(`Erro no teste Firestore: ${err.message}`)
  }
}

async function testCategories() {
  log('\n📂 TESTE 3: Categorias', 'blue')
  log('═'.repeat(50), 'blue')

  try {
    info('Consultando categorias...')
    const snapshot = await db.collection('categories').get()

    if (snapshot.empty) {
      error('Nenhuma categoria encontrada. Execute: npx ts-node scripts/init-firebase.ts')
    } else {
      success(`Encontradas ${snapshot.size} categorias:`)
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        log(`  ${data.icon} ${data.nome} (${data.cor})`, 'cyan')
      })
    }
  } catch (err: any) {
    error(`Erro ao consultar categorias: ${err.message}`)
  }
}

async function testValidations() {
  log('\n✓ TESTE 4: Validações', 'blue')
  log('═'.repeat(50), 'blue')

  const invalidMessages = [
    'Oi, tudo bem?',
    'Como você está?',
    'abcdef',
    '123',
  ]

  for (const msg of invalidMessages) {
    try {
      info(`Testando mensagem inválida: "${msg}"`)
      const result = await processExpenseMessage(msg)

      if ('error' in result) {
        success(`Corretamente rejeitado: ${result.error}`)
      } else {
        error('Deveria ter sido rejeitado mas foi aceito!')
      }

      await sleep(300)
    } catch (err: any) {
      error(`Erro inesperado: ${err.message}`)
    }
  }
}

async function testAPIs() {
  log('\n🌐 TESTE 5: APIs REST', 'blue')
  log('═'.repeat(50), 'blue')

  info('Este teste requer que o servidor Next.js esteja rodando (npm run dev)')
  info('Você pode testar manualmente com:')
  log('\n  curl http://localhost:3000/api/transactions?user_id=test', 'yellow')
  log('  curl -X POST http://localhost:3000/api/transactions -H "Content-Type: application/json" -d \'{"user_id":"test","valor":50,"categoria":"Alimentação","descricao":"Teste","data":"2025-11-18"}\'', 'yellow')
}

async function runAllTests() {
  log('\n╔══════════════════════════════════════════════════╗', 'cyan')
  log('║    TESTE END-TO-END - Assistente Financeiro      ║', 'cyan')
  log('╚══════════════════════════════════════════════════╝\n', 'cyan')

  try {
    await testAI()
    await testFirestore()
    await testCategories()
    await testValidations()
    await testAPIs()

    log('\n╔══════════════════════════════════════════════════╗', 'green')
    log('║           ✅ TODOS OS TESTES CONCLUÍDOS           ║', 'green')
    log('╚══════════════════════════════════════════════════╝\n', 'green')

    info('Próximos passos:')
    log('  1. Configure o Evolution API (WhatsApp)', 'yellow')
    log('  2. Configure o webhook', 'yellow')
    log('  3. Teste enviando mensagens reais no WhatsApp', 'yellow')
    log('  4. Acesse o dashboard em http://localhost:3000/dashboard', 'yellow')

  } catch (err: any) {
    error(`\n❌ Erro geral: ${err.message}`)
    process.exit(1)
  }
}

// Executar testes
runAllTests()
