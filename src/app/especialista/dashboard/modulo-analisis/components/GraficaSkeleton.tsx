'use client';

export function GraficaSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="animate-pulse">
        {/* Título */}
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        
        {/* Subtítulo */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        
        {/* Gráfica */}
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}

export default GraficaSkeleton;