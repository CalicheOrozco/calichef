"use client"
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#111' }}>
      <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem' }}>404 - Página no encontrada</h1>
      <p style={{ color: '#ccc', fontSize: '1.25rem' }}>Lo sentimos, la página que buscas no existe.</p>
    </div>
  );
}