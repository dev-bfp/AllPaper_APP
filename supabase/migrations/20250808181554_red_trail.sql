/*
  # Sistema de Casais - Gestão Financeira Compartilhada

  1. Novas Tabelas
    - `couple_invites`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key para couples)
      - `invited_email` (text)
      - `invited_by` (uuid, foreign key para profiles)
      - `status` (text: pending, accepted, rejected)
      - `created_at` (timestamp)

  2. Índices
    - Índice para busca eficiente de convites por email
    - Índice para busca de convites por casal
    - Índice para busca de convites por status

  3. Políticas de Segurança (RLS)
    - Usuários podem ver convites enviados para seu email
    - Usuários podem ver convites que enviaram
    - Usuários podem aceitar/rejeitar convites para seu email
    - Membros do casal podem enviar convites

  4. Constraints
    - Status deve ser um dos valores válidos
    - Email deve ser válido
    - Não permitir convites duplicados pendentes
*/

-- Criar tabela de convites de casal
CREATE TABLE IF NOT EXISTS couple_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_couple_invites_email ON couple_invites(invited_email);
CREATE INDEX IF NOT EXISTS idx_couple_invites_couple_id ON couple_invites(couple_id);
CREATE INDEX IF NOT EXISTS idx_couple_invites_status ON couple_invites(status);
CREATE INDEX IF NOT EXISTS idx_couple_invites_invited_by ON couple_invites(invited_by);

-- Constraint para status válidos
ALTER TABLE couple_invites 
ADD CONSTRAINT IF NOT EXISTS couple_invites_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Constraint para email válido (formato básico)
ALTER TABLE couple_invites 
ADD CONSTRAINT IF NOT EXISTS couple_invites_email_check 
CHECK (invited_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Constraint para evitar convites duplicados pendentes
CREATE UNIQUE INDEX IF NOT EXISTS idx_couple_invites_unique_pending 
ON couple_invites(couple_id, invited_email) 
WHERE status = 'pending';

-- Habilitar RLS
ALTER TABLE couple_invites ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver convites enviados para seu email
CREATE POLICY "Users can view invites sent to their email"
  ON couple_invites
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Política: Usuários podem ver convites que enviaram
CREATE POLICY "Users can view invites they sent"
  ON couple_invites
  FOR SELECT
  TO authenticated
  USING (invited_by = auth.uid());

-- Política: Membros do casal podem enviar convites
CREATE POLICY "Couple members can send invites"
  ON couple_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    couple_id IN (
      SELECT couple_id 
      FROM profiles 
      WHERE id = auth.uid() AND couple_id IS NOT NULL
    )
    AND invited_by = auth.uid()
  );

-- Política: Usuários podem atualizar convites enviados para seu email
CREATE POLICY "Users can update invites sent to their email"
  ON couple_invites
  FOR UPDATE
  TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Política: Usuários que enviaram o convite podem atualizá-lo
CREATE POLICY "Invite senders can update their invites"
  ON couple_invites
  FOR UPDATE
  TO authenticated
  USING (invited_by = auth.uid())
  WITH CHECK (invited_by = auth.uid());

-- Política: Usuários podem deletar convites que enviaram
CREATE POLICY "Users can delete invites they sent"
  ON couple_invites
  FOR DELETE
  TO authenticated
  USING (invited_by = auth.uid());

-- Atualizar políticas existentes para incluir dados do casal

-- Política para transações: membros do casal podem ver transações compartilhadas
DROP POLICY IF EXISTS "Couple members can view couple transactions" ON transactions;
CREATE POLICY "Couple members can view couple transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR user_id IN (
      SELECT p.id
      FROM profiles p
      WHERE p.couple_id IS NOT NULL 
      AND p.couple_id = (
        SELECT couple_id 
        FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Política para planejamentos: membros do casal podem ver planejamentos compartilhados
DROP POLICY IF EXISTS "Couple members can view couple plannings" ON plannings;
CREATE POLICY "Couple members can view couple plannings"
  ON plannings
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR user_id IN (
      SELECT p.id
      FROM profiles p
      WHERE p.couple_id IS NOT NULL 
      AND p.couple_id = (
        SELECT couple_id 
        FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Política para metas: membros do casal podem ver metas compartilhadas
DROP POLICY IF EXISTS "Users can view couple goals" ON goals;
CREATE POLICY "Users can view couple goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      couple_id IS NOT NULL 
      AND couple_id = (
        SELECT couple_id 
        FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Política para orçamentos: membros do casal podem ver orçamentos compartilhados
DROP POLICY IF EXISTS "Users can view couple budgets" ON budgets;
CREATE POLICY "Users can view couple budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      couple_id IS NOT NULL 
      AND couple_id = (
        SELECT couple_id 
        FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Função para notificar sobre novos convites (opcional, para futuras implementações)
CREATE OR REPLACE FUNCTION notify_couple_invite()
RETURNS TRIGGER AS $$
BEGIN
  -- Aqui poderia ser implementada lógica para envio de emails ou notificações
  -- Por enquanto, apenas retorna o novo registro
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificações de convites
DROP TRIGGER IF EXISTS couple_invite_notification ON couple_invites;
CREATE TRIGGER couple_invite_notification
  AFTER INSERT ON couple_invites
  FOR EACH ROW
  EXECUTE FUNCTION notify_couple_invite();