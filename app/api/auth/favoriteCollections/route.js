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

export async function POST(request) {
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
    
    // Obtener ID de la colección del cuerpo de la solicitud
    const { collectionId } = await request.json();
    console.log('Collection id  received:', collectionId);
    
    if (!collectionId) {
      return NextResponse.json(
        { success: false, message: 'Título de colección no proporcionado' },
        { status: 400 }
      );
    }

    // Obtener usuario
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar si la colección ya está en favoritos
    const isFavorite = user.favoriteCollections.includes(collectionId);
    console.log('User favorite collections before update:', user.favoriteCollections);
    
    // Actualizar favoritos (agregar o quitar)
    if (isFavorite) {
      // Quitar de favoritos
      user.favoriteCollections = user.favoriteCollections.filter(title => title !== collectionId);
    } else {
      // Agregar a favoritos
      user.favoriteCollections.push(collectionId);
    }
    console.log('User favorite collections after update:', user.favoriteCollections);
    
    // Guardar cambios
    await user.save();
    
    return NextResponse.json(
      {
        success: true,
        favoriteCollections: user.favoriteCollections,
        message: isFavorite ? 'Colección eliminada de favoritos' : 'Colección agregada a favoritos'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar colecciones favoritas:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}