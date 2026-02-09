-- Hotel Status Levels table for Hotel Benefits Management
-- Run this in Supabase SQL Editor (or any PostgreSQL client)

-- Function used by the updated_at trigger
CREATE OR REPLACE FUNCTION update_hotel_status_levels_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- Main table
CREATE TABLE IF NOT EXISTS public.hotel_status_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  program_id text NOT NULL,
  program_name text NOT NULL,
  current_level integer NOT NULL DEFAULT 1,
  level_name text NULL,
  valid_until date NULL,
  is_active boolean NULL DEFAULT true,
  level_definitions jsonb NULL,
  CONSTRAINT hotel_status_levels_pkey PRIMARY KEY (id),
  CONSTRAINT hotel_status_levels_program_id_key UNIQUE (program_id)
) TABLESPACE pg_default;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hotel_status_levels_program_id
  ON public.hotel_status_levels USING btree (program_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_hotel_status_levels_valid_until
  ON public.hotel_status_levels USING btree (valid_until) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_hotel_status_levels_is_active
  ON public.hotel_status_levels USING btree (is_active) TABLESPACE pg_default;

-- Trigger to auto-update updated_at on row update
DROP TRIGGER IF EXISTS trigger_update_hotel_status_levels_updated_at ON public.hotel_status_levels;
CREATE TRIGGER trigger_update_hotel_status_levels_updated_at
  BEFORE UPDATE ON public.hotel_status_levels
  FOR EACH ROW
  EXECUTE PROCEDURE update_hotel_status_levels_updated_at();
