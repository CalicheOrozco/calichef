'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Actualizar el estado de autenticación antes de redireccionar
      await refreshUser();
      router.push('/'); // Redireccionar al usuario a la página principal
      // router.refresh(); // Ya no es necesario forzar refresh manual
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="max-w-lg w-full bg-neutral-900 p-8 rounded-lg shadow-md">
            <img src="/calichefLogo.png" alt="Logo" className="mx-auto mb-4" />
          
          <h2 className="text-xl text-center text-white mb-6">Bienvenido</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                id="email"
                placeholder="Dirección de correo electrónico*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-neutral-800 text-white"
                required
              />
            </div>
            
            <div className="mb-6 relative">
              <input
                type="password"
                id="password"
                placeholder="Contraseña*"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-neutral-800 text-white"
                required
              />
              <span className="absolute right-3 top-3 cursor-pointer text-white">👁️</span>
            </div>
            
            <Link href="/forgot-password" className="text-blue-500 hover:text-blue-600 text-sm block mb-4">
              ¿Olvidaste tu contraseña?
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
            >
              {loading ? 'Iniciando sesión...' : 'Continuar'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-white">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-600">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}