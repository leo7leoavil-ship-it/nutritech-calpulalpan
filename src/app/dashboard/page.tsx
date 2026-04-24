import { createClient } from '@/lib/server';
import { redirect } from 'next/navigation';

export default async function DashboardRouterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, registro_completo')
    .eq('id', user.id)
    .single();

  if (!perfil?.registro_completo) redirect('/registro-fijo');

  if (perfil?.rol === 'especialista') redirect('/especialista/dashboard');

  // default: paciente
  redirect('/paciente/dashboard');
}

