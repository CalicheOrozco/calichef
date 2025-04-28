import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Función para verificar el token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Endpoint para guardar o actualizar notas de recetas
export async function POST(request) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    const userId = decoded.id;

    // Obtener datos de la solicitud
    const { recipeId, noteContent } = await request.json();

    if (!recipeId) {
      return NextResponse.json({ success: false, message: 'ID de receta requerido' }, { status: 400 });
    }

    // Conectar a la base de datos
    const conn = await connectDB();
    const db = conn.connection.db;

    // 1️⃣ Asegurarse de que notes sea un array
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId), $expr: { $ne: [{ $type: "$notes" }, "array"] } },
      { $set: { notes: [] } }
    );

    // 2️⃣ Actualizar la nota existente si ya existe
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId), "notes.idRecipe": recipeId },
      {
        $set: {
          "notes.$.note": noteContent,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      // Si no se encontró la nota, agregar una nueva
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            notes: { idRecipe: recipeId, note: noteContent }
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener el usuario actualizado para devolver las notas actualizadas
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { notes: 1 } }
    );

    return NextResponse.json({
      success: true,
      message: 'Notas actualizadas correctamente',
      notes: updatedUser.notes || []
    });

  } catch (error) {
    console.error('Error al actualizar notas:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}


// Endpoint para obtener todas las notas del usuario
export async function GET(request) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }
    
    const userId = decoded.id;
    
    // Conectar a la base de datos
    const { db } = await connectDB();
    
    // Obtener las notas del usuario
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { notes: 1 } }
    );
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      notes: user.notes || []
    });
    
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    const userId = decoded.id;

    // Obtener datos de la solicitud
    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json({ success: false, message: 'ID de receta requerido' }, { status: 400 });
    }

    // Conectar a la base de datos
    const conn = await connectDB();
    const db = conn.connection.db;

    // Eliminar la nota de la receta
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { notes: { idRecipe: recipeId } } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: 'Nota no encontrada' }, { status: 404 });
    }

    // Obtener el usuario actualizado para devolver las notas actualizadas
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { notes: 1 } }
    );

    return NextResponse.json({
      success: true,
      message: 'Nota eliminada correctamente',
      notes: updatedUser.notes || []
    });

  } catch (error) {
    console.error('Error al eliminar nota:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}