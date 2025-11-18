/**
 * Script para inicializar o Firebase com as categorias padrão
 *
 * Execute com: npx ts-node scripts/init-firebase.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Inicializar Firebase Admin
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

const categorias = [
  { nome: 'Alimentação', cor: '#FF6B6B', icon: '🍔' },
  { nome: 'Transporte', cor: '#4ECDC4', icon: '🚗' },
  { nome: 'Moradia', cor: '#95E1D3', icon: '🏠' },
  { nome: 'Saúde', cor: '#F38181', icon: '⚕️' },
  { nome: 'Lazer', cor: '#AA96DA', icon: '🎉' },
  { nome: 'Investimentos', cor: '#5F9EA0', icon: '💰' },
  { nome: 'Educação', cor: '#FFD93D', icon: '📚' },
  { nome: 'Compras', cor: '#6BCB77', icon: '🛍️' },
  { nome: 'Outros', cor: '#A8DADC', icon: '📦' },
]

async function initializeFirebase() {
  console.log('🔥 Inicializando Firebase...\n')

  try {
    // Criar categorias
    console.log('📁 Criando categorias...')
    const categoriesRef = db.collection('categories')

    for (const categoria of categorias) {
      // Verificar se já existe
      const existing = await categoriesRef.where('nome', '==', categoria.nome).limit(1).get()

      if (existing.empty) {
        await categoriesRef.add({
          ...categoria,
          created_at: new Date(),
        })
        console.log(`  ✅ Categoria "${categoria.nome}" criada`)
      } else {
        console.log(`  ⏭️  Categoria "${categoria.nome}" já existe`)
      }
    }

    console.log('\n✅ Firebase inicializado com sucesso!')
    console.log('\n📊 Próximos passos:')
    console.log('   1. Configure as regras de segurança no Firebase Console')
    console.log('   2. Crie índices compostos necessários (data + user_id)')
    console.log('   3. Teste o webhook do WhatsApp')

  } catch (error) {
    console.error('\n❌ Erro ao inicializar Firebase:', error)
    process.exit(1)
  }
}

initializeFirebase()
