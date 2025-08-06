/*
  # Initial AllPaper APP Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `avatar_url` (text, optional)
      - `couple_id` (uuid, optional, for linking couples)
      - `created_at` (timestamp)
    - `cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `type` (text, credit/debit)
      - `last_four` (text)
      - `bank` (text)
      - `limit_amount` (numeric, optional)
      - `current_balance` (numeric, optional)
      - `created_at` (timestamp)
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `card_id` (uuid, references cards, optional)
      - `amount` (numeric)
      - `description` (text)
      - `category` (text)
      - `type` (text, income/expense)
      - `installments` (integer, optional)
      - `current_installment` (integer, optional)
      - `due_date` (date)
      - `is_recurring` (boolean, default false)
      - `created_at` (timestamp)
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `couple_id` (uuid, optional)
      - `name` (text)
      - `target_amount` (numeric)
      - `current_amount` (numeric, default 0)
      - `target_date` (date)
      - `description` (text, optional)
      - `created_at` (timestamp)
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `couple_id` (uuid, optional)
      - `category` (text)
      - `monthly_limit` (numeric)
      - `current_spent` (numeric, default 0)
      - `month` (text, format YYYY-MM)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for couple data sharing
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  couple_id uuid,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  last_four text NOT NULL,
  bank text NOT NULL,
  limit_amount numeric,
  current_balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  card_id uuid REFERENCES cards(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  installments integer,
  current_installment integer,
  due_date date NOT NULL,
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid,
  name text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  target_date date NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid,
  category text NOT NULL,
  monthly_limit numeric NOT NULL,
  current_spent numeric DEFAULT 0,
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, month)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Cards policies
CREATE POLICY "Users can manage own cards"
  ON cards FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Goals policies
CREATE POLICY "Users can manage own goals"
  ON goals FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view couple goals"
  ON goals FOR SELECT
  TO authenticated
  USING (
    couple_id IS NOT NULL AND 
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

-- Budgets policies
CREATE POLICY "Users can manage own budgets"
  ON budgets FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view couple budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (
    couple_id IS NOT NULL AND 
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();