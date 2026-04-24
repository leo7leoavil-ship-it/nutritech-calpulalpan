import { CheckCircle2, Clock } from 'lucide-react';

export function Badge({
  status,
  registroCompleto,
}: {
  status: string;
  registroCompleto: boolean;
}) {
  if (!registroCompleto) {
    return (
      <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        <Clock size={14} />
        Registro incompleto
      </span>
    );
  }
  if (status === 'atendida') {
    return (
      <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <CheckCircle2 size={14} />
        Atendida
      </span>
    );
  }
  return (
    <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      <Clock size={14} />
      Pendiente
    </span>
  );
}

