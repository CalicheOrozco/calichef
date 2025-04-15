import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Crear respuesta
    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada correctamente' },
      { status: 200 }
    );
    
    // Eliminar la cookie del token
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Error en el logout:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}