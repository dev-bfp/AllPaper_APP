/*
  # Create plannings table

  1. New Tables
    - `plannings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `description` (text)
      - `amount` (numeric)
      - `category` (text)
      - `due_date` (date)
      - `status` (text, paid/pending/overdue)
      - `is_recurring` (boolean, default false)
      - `installments` (integer, optional)
      - `current_installment` (integer, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `plannings` table
    - Add policy for authenticated users to manage their own plannings
*/

CREATE TABLE IF NOT EXISTS plannings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  is_recurring boolean DEFAULT false,
  installments integer,
  current_installment integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plannings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own plannings"
  ON plannings FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plannings_user_id ON plannings(user_id);
CREATE INDEX IF NOT EXISTS idx_plannings_due_date ON plannings(due_date);
CREATE INDEX IF NOT EXISTS idx_plannings_status ON plannings(status);