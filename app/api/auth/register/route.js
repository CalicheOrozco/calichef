import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Obtener datos del cuerpo de la solicitud
    const { name, email, password } = await request.json();
    const lowerCaseEmail = email.toLowerCase();
    
    // Validar datos
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Por favor proporcione todos los campos requeridos' },
        { status: 400 }
      );
    }
    
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email: lowerCaseEmail });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: 'Este correo electrónico ya está registrado' },
        { status: 400 }
      );
    }
    
    // Crear usuario
    const user = await User.create({
      name,
      email: lowerCaseEmail,
      password
    });
    
    // Crear respuesta sin incluir la contraseña
    const response = {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error en el registro:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}