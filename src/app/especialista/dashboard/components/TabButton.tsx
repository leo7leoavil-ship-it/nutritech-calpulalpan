export function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-full border transition-colors ${
        active
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

