import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Importar variables de entorno
import { config } from 'dotenv';

// Configurar variables de entorno
config();

// Obtener la clave secreta de las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;

// Verificar que la clave secreta esté definida
if (!JWT_SECRET) {
  throw new Error('La variable de entorno JWT_SECRET no está definida');
}

export async function GET(request) {
  try {
    // Obtener token de la cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Conectar a la base de datos
    await connectDB();
    
    // Buscar usuario por ID (sin incluir la contraseña)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          favorites: user.favorites,
          favoriteCollections: user.favoriteCollections,
          notes: user.notes || {}
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 401 }
    );
  }
}