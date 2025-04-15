import mongoose from 'mongoose';

// Importar variables de entorno
import { config } from 'dotenv';

// Configurar variables de entorno
config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor define la variable de entorno MONGODB_URI');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }
    
    cached.conn = await cached.promise;
    console.log('MongoDB conectado exitosamente');
    return cached.conn;
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    throw new Error('Error al conectar con la base de datos');
  }
}

export default connectDB;