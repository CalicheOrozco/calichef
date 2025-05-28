import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Importar variables de entorno
import { config } from 'dotenv';

// Configurar variables de entorno
config();

// Obtener la clave secreta de las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';

export async function POST(request) {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Obtener datos del cuerpo de la solicitud
    const { email, password } = await request.json();
    const lowerCaseEmail = email.toLowerCase();
    
    // Validar datos
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Por favor proporcione email y contraseña' },
        { status: 400 }
      );
    }
    
    // Buscar usuario y seleccionar explícitamente el campo password
    const user = await User.findOne({ email: lowerCaseEmail }).select('+password');
    
    // Verificar si el usuario existe
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Crear token JWT
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Configurar cookie con el token
    const response = NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          favorites: user.favorites
        }
      },
      { status: 200 }
    );
    
    // Establecer cookie segura
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Error en el login:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}