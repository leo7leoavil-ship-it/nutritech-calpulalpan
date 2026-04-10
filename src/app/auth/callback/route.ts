import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Intercambio de código por sesión
    await supabase.auth.exchangeCodeForSession(code);

    // Verificación de perfil existente
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('registro_completo, rol')
        .eq('id', user.id)
        .single();

      // Redirección lógica: Nuevo -> Registro | Existente -> Dashboard/Panel
      if (!perfil || !perfil.registro_completo) {
        return NextResponse.redirect(`${requestUrl.origin}/registro-fijo`);
      }

      const destination = perfil.rol === 'especialista' ? '/(especialista)/panel' : '/dashboard';
      // Nota: En Next.js App Router, el grupo de ruta (paciente) no va en la URL final
      const cleanDestination = destination.replace(/\(([^)]+)\)\//, '');
      
      return NextResponse.redirect(`${requestUrl.origin}${cleanDestination}`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`);
}