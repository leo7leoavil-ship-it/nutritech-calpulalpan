import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 'next' permite redirigir al usuario a la página donde estaba antes de loguearse
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Intercambiamos el código de Google por una sesión real
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Consultamos si el usuario ya terminó su registro médico
        const { data: perfil, error: perfilError } = await supabase
          .from('perfiles')
          .select('registro_completo')
          .eq('id', user.id)
          .single()

        // Si hay error de perfil (no existe) o no ha completado el registro:
        if (perfilError || !perfil?.registro_completo) {
          return NextResponse.redirect(`${origin}/registro-fijo`)
        }

        // Si todo está en orden, al Dashboard
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Si algo falla en el proceso, regresamos al login para reintentar
  return NextResponse.redirect(`${origin}/login`)
}