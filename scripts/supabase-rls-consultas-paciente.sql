-- Ejecutar en Supabase: SQL Editor (como postgres / service role no es necesario para probar políticas).
-- Error típico sin esto: "new row violates row-level security policy for table 'consulta_antropometria'"
--
-- El cliente usa NEXT_PUBLIC_SUPABASE_ANON_KEY + sesión del usuario; RLS aplica con auth.uid().
-- perfil_id en las tablas consulta_* debe coincidir con el id del usuario en auth (mismo que perfiles.id).

-- ---------- consulta_antropometria ----------
ALTER TABLE public.consulta_antropometria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consulta_antropometria_insert_own" ON public.consulta_antropometria;
DROP POLICY IF EXISTS "consulta_antropometria_select_own" ON public.consulta_antropometria;

CREATE POLICY "consulta_antropometria_insert_own"
  ON public.consulta_antropometria
  FOR INSERT
  TO authenticated
  WITH CHECK (perfil_id = auth.uid());

CREATE POLICY "consulta_antropometria_select_own"
  ON public.consulta_antropometria
  FOR SELECT
  TO authenticated
  USING (perfil_id = auth.uid());

-- ---------- consulta_evaluacion_dietetica ----------
ALTER TABLE public.consulta_evaluacion_dietetica ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consulta_evaluacion_dietetica_insert_own" ON public.consulta_evaluacion_dietetica;
DROP POLICY IF EXISTS "consulta_evaluacion_dietetica_select_own" ON public.consulta_evaluacion_dietetica;

CREATE POLICY "consulta_evaluacion_dietetica_insert_own"
  ON public.consulta_evaluacion_dietetica
  FOR INSERT
  TO authenticated
  WITH CHECK (perfil_id = auth.uid());

CREATE POLICY "consulta_evaluacion_dietetica_select_own"
  ON public.consulta_evaluacion_dietetica
  FOR SELECT
  TO authenticated
  USING (perfil_id = auth.uid());

-- ---------- consulta_estilo_vida ----------
ALTER TABLE public.consulta_estilo_vida ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consulta_estilo_vida_insert_own" ON public.consulta_estilo_vida;
DROP POLICY IF EXISTS "consulta_estilo_vida_select_own" ON public.consulta_estilo_vida;

CREATE POLICY "consulta_estilo_vida_insert_own"
  ON public.consulta_estilo_vida
  FOR INSERT
  TO authenticated
  WITH CHECK (perfil_id = auth.uid());

CREATE POLICY "consulta_estilo_vida_select_own"
  ON public.consulta_estilo_vida
  FOR SELECT
  TO authenticated
  USING (perfil_id = auth.uid());

-- ---------- consulta_recordatorio_24h ----------
ALTER TABLE public.consulta_recordatorio_24h ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consulta_recordatorio_24h_insert_own" ON public.consulta_recordatorio_24h;
DROP POLICY IF EXISTS "consulta_recordatorio_24h_select_own" ON public.consulta_recordatorio_24h;

CREATE POLICY "consulta_recordatorio_24h_insert_own"
  ON public.consulta_recordatorio_24h
  FOR INSERT
  TO authenticated
  WITH CHECK (perfil_id = auth.uid());

CREATE POLICY "consulta_recordatorio_24h_select_own"
  ON public.consulta_recordatorio_24h
  FOR SELECT
  TO authenticated
  USING (perfil_id = auth.uid());

-- ---------- consultas (fila principal) ----------
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultas_insert_as_paciente" ON public.consultas;
DROP POLICY IF EXISTS "consultas_select_as_paciente" ON public.consultas;

CREATE POLICY "consultas_insert_as_paciente"
  ON public.consultas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    paciente_id = auth.uid()
    AND coalesce(status, 'pendiente') = 'pendiente'
  );

CREATE POLICY "consultas_select_as_paciente"
  ON public.consultas
  FOR SELECT
  TO authenticated
  USING (paciente_id = auth.uid());

-- Especialista asignado: ver consultas y actualizar (p. ej. status → atendida)
DROP POLICY IF EXISTS "consultas_select_as_especialista" ON public.consultas;
DROP POLICY IF EXISTS "consultas_update_by_especialista" ON public.consultas;

CREATE POLICY "consultas_select_as_especialista"
  ON public.consultas
  FOR SELECT
  TO authenticated
  USING (especialista_id IS NOT NULL AND especialista_id = auth.uid());

CREATE POLICY "consultas_update_by_especialista"
  ON public.consultas
  FOR UPDATE
  TO authenticated
  USING (especialista_id IS NOT NULL AND especialista_id = auth.uid())
  WITH CHECK (especialista_id IS NOT NULL AND especialista_id = auth.uid());
