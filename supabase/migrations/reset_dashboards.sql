/*
      # Reset Dashboards

      1. Changes
        - Drop existing dashboard data.
        - Insert default dashboard data.
      2. Security
        - Ensure that row-level security is maintained.
    */

    -- Drop existing dashboard data
    TRUNCATE TABLE dashboards RESTART IDENTITY;

    -- Insert default dashboard data
    INSERT INTO dashboards (name, created_at)
    VALUES 
      ('Dashboard 1', now()),
      ('Dashboard 2', now()),
      ('Dashboard 3', now());
