/**
 * API Route para consultar Expedientes
 * 
 * Endpoint: /api/especialista/expedientes
 * Métodos: GET
 * 
 * Query params:
 * - search: string - Búsqueda por CURP o nombre
 * - fechaInicio: string - Fecha de inicio (ISO)
 * - fechaFin: string - Fecha de fin (ISO)
 * - page: number - Página (default: 0)
 * - pageSize: number - Tamaño de página (default: 10)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getExpedienteDetalle, getExpedientes } from '../utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      search: searchParams.get('search') || '',
      fechaInicio: searchParams.get('fechaInicio'),
      fechaFin: searchParams.get('fechaFin'),
      page: parseInt(searchParams.get('page') || '0', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
    };

    const result = await getExpedientes(filters);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en API expedientes:', error);
    
    if (error.message === 'No autenticado') {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (error.message === 'Acceso denegado: se requiere rol de especialista') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API Route para obtener detalle de un expediente
 * 
 * Endpoint: /api/especialista/expedientes/[id]
 * Métodos: GET
 */
 
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consultaId } = body;
    
    if (!consultaId) {
      return NextResponse.json(
        { error: 'ID de consulta requerido' },
        { status: 400 }
      );
    }
    
    const detalle = await getExpedienteDetalle(consultaId);
    
    if (!detalle) {
      return NextResponse.json(
        { error: 'Expediente no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(detalle);
  } catch (error: any) {
    console.error('Error en API detalle expediente:', error);
    
    if (error.message === 'No autenticado') {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (error.message === 'Acceso denegado: se requiere rol de especialista') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}