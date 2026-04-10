'use client';
import { supabase } from '@/lib/supabase';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Nutri-Tech Calpulalpan</h2>
          <p className="mt-2 text-sm text-gray-600">Bienvenido al Sistema de Atención Nutricional</p>
        </div>
        
        <button
          onClick={handleLogin}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <LogIn className="h-5 w-5 text-blue-300 group-hover:text-blue-100" />
          </span>
          Iniciar sesión con Google
        </button>
        
        <p className="text-center text-xs text-gray-400">
          Uso exclusivo para la comunidad universitaria de Tlaxcala.
        </p>
      </div>
    </div>
  );
}