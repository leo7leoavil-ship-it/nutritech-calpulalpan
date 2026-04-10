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

    // Obtener datos del usuario
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('registro_completo, rol')
        .eq('id', user.id)
        .single();

      // Si no existe perfil o no ha terminado el registro, va a registro-fijo
      if (!perfil || !perfil.registro_completo) {
        return NextResponse.redirect(`${requestUrl.origin}/registro-fijo`);
      }

      // Si ya está registrado, decidir ruta por rol
      // Nota: Aquí redirigimos a la ruta final, Next.js resuelve los grupos (paciente) internamente
      const destination = perfil.rol === 'especialista' ? '/panel' : '/dashboard';
      
      return NextResponse.redirect(`${requestUrl.origin}${destination}`);
    }
  }

  // En caso de error o falta de código, volver al login
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}