export function AlertDot({
  color,
  text,
}: {
  color: 'red' | 'amber' | 'green';
  text: string;
}) {
  const cls =
    color === 'red'
      ? 'bg-red-500'
      : color === 'amber'
        ? 'bg-amber-500'
        : 'bg-green-500';
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <span className={`w-2 h-2 rounded-full ${cls}`} />
      <span>{text}</span>
    </div>
  );
}

