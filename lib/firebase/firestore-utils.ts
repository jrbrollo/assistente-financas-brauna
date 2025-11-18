import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore'
import { db } from './client'
import { adminDb } from './admin'

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
}

// Converter Date para Timestamp do Firestore
export function dateToTimestamp(date: Date | string): Timestamp {
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date))
  }
  return Timestamp.fromDate(date)
}

// Converter Timestamp do Firestore para Date
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate()
}

// Converter Timestamp do Firestore para string ISO
export function timestampToString(timestamp: Timestamp): string {
  return timestamp.toDate().toISOString()
}

// Helper para criar queries no client-side
export function createQuery(
  collectionName: string,
  constraints: QueryConstraint[]
) {
  return query(collection(db, collectionName), ...constraints)
}

// Helper para queries no server-side (admin)
export async function getDocumentsByQuery(
  collectionName: string,
  constraints: Array<{ field: string; operator: any; value: any }>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc'
) {
  let q = adminDb.collection(collectionName)

  // Aplicar where constraints
  constraints.forEach(({ field, operator, value }) => {
    q = q.where(field, operator, value) as any
  })

  // Aplicar ordenação
  if (orderByField) {
    q = q.orderBy(orderByField, orderDirection) as any
  }

  const snapshot = await q.get()
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// Inicializar categorias padrão
export const DEFAULT_CATEGORIES = [
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
