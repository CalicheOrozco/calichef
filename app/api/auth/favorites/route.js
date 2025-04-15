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
    
    // Obtener ID de la receta del cuerpo de la solicitud
    const { recipeId } = await request.json();
    
    if (!recipeId) {
      return NextResponse.json(
        { success: false, message: 'ID de receta no proporcionado' },
        { status: 400 }
      );
    }
    
    // Buscar usuario por ID
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar si la receta ya está en favoritos
    const isFavorite = user.favorites.includes(recipeId);
    
    // Actualizar favoritos (agregar o quitar)
    if (isFavorite) {
      // Quitar de favoritos
      user.favorites = user.favorites.filter(id => id !== recipeId);
    } else {
      // Agregar a favoritos
      user.favorites.push(recipeId);
    }
    
    // Guardar cambios
    await user.save();
    
    return NextResponse.json(
      {
        success: true,
        favorites: user.favorites,
        message: isFavorite ? 'Receta eliminada de favoritos' : 'Receta agregada a favoritos'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar favoritos:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}