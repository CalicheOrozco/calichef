'use client'
export default function Error() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#111' }}>
      <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem' }}>500 - Error interno del servidor</h1>
      <p style={{ color: '#ccc', fontSize: '1.25rem' }}>Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.</p>
    </div>
  );
}