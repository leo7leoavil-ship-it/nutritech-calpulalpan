import React from 'react';

export default function RegistroFijoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-gray-50 min-h-screen">
      {/* Aquí podrías poner un header común para todo el registro */}
      {children}
    </section>
  );
}