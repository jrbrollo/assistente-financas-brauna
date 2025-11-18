-- Criação das tabelas para o Assistente Financeiro Braúna

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) UNIQUE NOT NULL,
  cor VARCHAR(7) NOT NULL, -- Formato hex: #RRGGBB
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_data ON transactions(data);
CREATE INDEX IF NOT EXISTS idx_transactions_categoria ON transactions(categoria);
CREATE INDEX IF NOT EXISTS idx_users_telefone ON users(telefone);

-- Inserir categorias padrão
INSERT INTO categories (nome, cor, icon) VALUES
  ('Alimentação', '#FF6B6B', '🍔'),
  ('Transporte', '#4ECDC4', '🚗'),
  ('Moradia', '#95E1D3', '🏠'),
  ('Saúde', '#F38181', '⚕️'),
  ('Lazer', '#AA96DA', '🎉'),
  ('Investimentos', '#5F9EA0', '💰'),
  ('Educação', '#FFD93D', '📚'),
  ('Compras', '#6BCB77', '🛍️'),
  ('Outros', '#A8DADC', '📦')
ON CONFLICT (nome) DO NOTHING;

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users podem ver seus próprios dados"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users podem atualizar seus próprios dados"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Políticas RLS para transactions
CREATE POLICY "Users podem ver suas próprias transações"
  ON transactions FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users podem inserir suas próprias transações"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users podem atualizar suas próprias transações"
  ON transactions FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users podem deletar suas próprias transações"
  ON transactions FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Políticas RLS para categories (público para leitura)
CREATE POLICY "Categories são públicas para leitura"
  ON categories FOR SELECT
  TO public
  USING (true);

-- View para estatísticas rápidas
CREATE OR REPLACE VIEW user_transaction_stats AS
SELECT
  user_id,
  COUNT(*) as total_transacoes,
  SUM(valor) as total_gasto,
  AVG(valor) as media_gasto,
  MIN(valor) as menor_gasto,
  MAX(valor) as maior_gasto,
  DATE_TRUNC('month', data) as mes
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', data);

-- View para gastos por categoria
CREATE OR REPLACE VIEW gastos_por_categoria AS
SELECT
  t.user_id,
  t.categoria,
  c.cor,
  c.icon,
  SUM(t.valor) as total,
  COUNT(*) as quantidade,
  DATE_TRUNC('month', t.data) as mes
FROM transactions t
LEFT JOIN categories c ON t.categoria = c.nome
GROUP BY t.user_id, t.categoria, c.cor, c.icon, DATE_TRUNC('month', t.data);
