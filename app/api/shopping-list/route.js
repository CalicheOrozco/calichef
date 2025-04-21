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
    const userId = getUserIdFromRequest(request);
    const { recipeId } = await request.json();

    if (!recipeId) {
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

    const recipeExists = user.shoppingList.includes(recipeId);
    if (!recipeExists) {
      user.shoppingList.push(recipeId);
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
    const { recipeId, count } = await request.json();
    
    if (!recipeId || typeof count !== 'number') {
      return new Response(JSON.stringify({ error: 'ID de receta y cantidad requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const recipeIndex = user.shoppingList.findIndex(item => item.idRecipie === recipeId);
    if (recipeIndex !== -1) {
      user.shoppingList[recipeIndex].count += count;
      if (user.shoppingList[recipeIndex].count <= 0) {
        user.shoppingList.splice(recipeIndex, 1);
      }
    } else if (count > 0) {
      user.shoppingList.push({ idRecipie: recipeId, count });
    }
    await connectDB();

    const user = await User.findById(userId);
    if (user) {
      user.shoppingList = user.shoppingList.filter(item => item.idRecipie !== recipeId);
      await user.save();
    }

    return new Response(JSON.stringify({ items: user?.shoppingList || [] }), {
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
