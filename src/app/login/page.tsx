'use client';
import { createClient } from '@/lib/client';
import { LogIn } from 'lucide-react';
// Eliminamos la constante de aquí afuera

export default function LoginPage() {
  // Inicializamos el cliente dentro del componente o usamos una referencia estable
  const supabase = createClient();

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Aseguramos que el callback use la URL correcta de Vercel o Localhost
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error en la autenticación:', error);
      alert('No se pudo iniciar sesión con Google.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          {/* Estética alineada al diseño de Calpulalpan */}
          <h2 className="text-3xl font-bold text-blue-900 tracking-tight">
            Nutri-Tech <span className="text-blue-500">Calpulalpan</span>
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Sistema de Atención Nutricional en Línea
          </p>
        </div>
        
        <div className="py-4">
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-4 px-4 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-4">
              {/* Icono de Google simulado o Lucide LogIn */}
              <LogIn className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </span>
            Continuar con Google
          </button>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
            Acceso Institucional
          </p>
          <p className="text-xs text-gray-400">
            Uso exclusivo para la comunidad universitaria de Tlaxcala.
          </p>
        </div>
      </div>
    </div>
  );
}