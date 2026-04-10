import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // CORRECCIÓN CLAVE: Pasamos 'cookies' directamente como objeto, 
    // sin el envoltorio de función () => cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // Intercambio de código por sesión
    await supabase.auth.exchangeCodeForSession(code);

    // Obtener datos del usuario
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('registro_completo, rol')
        .eq('id', user.id)
        .single();

      // Si no hay perfil o registro incompleto -> registro-fijo
      if (!perfil || !perfil.registro_completo) {
        return NextResponse.redirect(`${requestUrl.origin}/registro-fijo`);
      }

      // Si ya existe, decidir ruta por rol
      const destination = perfil.rol === 'especialista' ? '/panel' : '/dashboard';
      return NextResponse.redirect(`${requestUrl.origin}${destination}`);
    }
  }

  // Si algo falla, volver al login
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}