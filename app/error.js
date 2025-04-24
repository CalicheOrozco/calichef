'use client'
export default function Error() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#111' }}>
      <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem' }}>500 - Internal Server Error</h1>
      <p style={{ color: '#ccc', fontSize: '1.25rem' }}>An unexpected error has occurred. Please try again later.</p>
    </div>
  );
}