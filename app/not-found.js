'use client'
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#111' }}>
      <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem' }}>404 - Page not found</h1>
      <p style={{ color: '#ccc', fontSize: '1.25rem' }}>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}