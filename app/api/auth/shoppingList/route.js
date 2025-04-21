import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('La variable de entorno JWT_SECRET no está definida');
}

function getUserIdFromRequest(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) throw new Error('Token no encontrado');
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.id;
}

export async function GET(request) {
  try {
    const userId = getUserIdFromRequest(request);
    await connectDB();

    const user = await User.findById(userId);

    return new Response(JSON.stringify({ items: user?.shoppingList || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener la lista de compras:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: error.message === 'Token no encontrado' ? 401 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    console.log('POST /shoppingList llamado');
    let userId;
    try {
      userId = getUserIdFromRequest(request);
    } catch (err) {
      console.error('Error obteniendo userId:', err);
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    let body;
    try {
      body = await request.json();
      console.log('Body recibido en POST /shoppingList:', body);
    } catch (err) {
      console.error('Error parseando body:', err);
      return new Response(JSON.stringify({ error: 'Formato de JSON inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { idRecipe, count = 1 } = body;

    if (!idRecipe) {
      console.error('idRecipe no proporcionado');
      return new Response(JSON.stringify({ error: 'ID de receta requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      console.error('Usuario no encontrado');
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Buscar si ya existe el objeto con ese idRecipe
    const recipeIndex = user.shoppingList.findIndex(item => item.idRecipe === idRecipe);
    if (recipeIndex === -1) {
      user.shoppingList.push({ idRecipe, count });
    } else {
      // Si ya existe, actualiza el count
      user.shoppingList[recipeIndex].count = count;
    }
    await user.save();
    return new Response(JSON.stringify({ items: user.shoppingList }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al agregar a la lista de compras:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: error.message === 'Token no encontrado' ? 401 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request) {
  try {
    const userId = getUserIdFromRequest(request);
    const { idRecipe } = await request.json();

    if (!idRecipe) {
      return new Response(JSON.stringify({ error: 'ID de receta requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (user) {
      user.shoppingList = user.shoppingList.filter(item => item.idRecipe !== idRecipe);
      await user.save();
    }

    return new Response(JSON.stringify({ items: user.shoppingList }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al eliminar de la lista de compras:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: error.message === 'Token no encontrado' ? 401 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(request) {
  try {
    const userId = getUserIdFromRequest(request);
    const { idRecipe, count = 1 } = await request.json();

    if (!idRecipe) {
      return new Response(JSON.stringify({ error: 'ID de receta requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const recipeIndex = user.shoppingList.findIndex(item => item.idRecipe === idRecipe);
    if (recipeIndex === -1) {
      user.shoppingList.push({ idRecipe, count });
    } else {
      user.shoppingList[recipeIndex].count += count;
    }
    await user.save();

    return new Response(JSON.stringify({ items: user.shoppingList }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al actualizar la lista de compras:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: error.message === 'Token no encontrado' ? 401 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}