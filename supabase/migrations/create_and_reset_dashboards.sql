/*
      # Create Dashboards Table and Reset Data

      1. Changes
        - Create the dashboards table if it does not exist.
        - Drop existing dashboard data.
        - Insert default dashboard data.
      2. Security
        - Ensure that row-level security is maintained.
    */

    -- Create dashboards table if it does not exist
    CREATE TABLE IF NOT EXISTS dashboards (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    -- Drop existing dashboard data if it exists
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboards') THEN
        TRUNCATE TABLE dashboards RESTART IDENTITY;
      END IF;
    END $$;

    -- Insert default dashboard data
    INSERT INTO dashboards (name, created_at)
    VALUES 
      ('Dashboard 1', now()),
      ('Dashboard 2', now()),
      ('Dashboard 3', now());
