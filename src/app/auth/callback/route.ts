import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Sintaxis corregida: pasamos el objeto cookies directamente
    const supabase = createRouteHandlerClient({ cookies });
    
    // Intercambio de código por sesión
    await supabase.auth.exchangeCodeForSession(code);

    // Obtener datos del usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Consultar el perfil en la base de datos
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('registro_completo, rol')
        .eq('id', user.id)
        .single();

      // Si el perfil no existe o el registro no está completo -> Registro Fijo
      if (!perfil || !perfil.registro_completo) {
        return NextResponse.redirect(`${requestUrl.origin}/registro-fijo`);
      }

      // Si ya está registrado, redirigir según rol
      const destination = perfil.rol === 'especialista' ? '/panel' : '/dashboard';
      return NextResponse.redirect(`${requestUrl.origin}${destination}`);
    }
  }

  // Retorno por defecto al login si algo falla
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}