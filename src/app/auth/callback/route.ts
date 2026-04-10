import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // Verificamos si el usuario ya tiene perfil completo
    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('registro_completo, rol')
      .eq('id', user?.id)
      .single();

    if (!perfil || !perfil.registro_completo) {
      return NextResponse.redirect(`${requestUrl.origin}/registro-fijo`);
    }

    // Si ya existe, enviamos según su rol
    const route = perfil.rol === 'especialista' ? '/panel' : '/dashboard';
    return NextResponse.redirect(`${requestUrl.origin}${route}`);
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`);
}