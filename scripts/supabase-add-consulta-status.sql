-- Ejecutar en Supabase → SQL Editor.
-- Estado del flujo de consulta: pendiente hasta que el especialista la marque atendida.

ALTER TABLE public.consultas
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendiente';

ALTER TABLE public.consultas
  DROP CONSTRAINT IF EXISTS consultas_status_check;

ALTER TABLE public.consultas
  ADD CONSTRAINT consultas_status_check
  CHECK (status = ANY (ARRAY['pendiente'::text, 'atendida'::text]));

COMMENT ON COLUMN public.consultas.status IS 'pendiente: enviada por el paciente; atendida: revisada por el especialista.';
