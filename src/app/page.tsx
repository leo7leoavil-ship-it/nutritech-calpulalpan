import { redirect } from 'next/navigation';

export default function Home() {
  // Redirección inmediata al flujo de Nutri-Tech
  redirect('/login');
}