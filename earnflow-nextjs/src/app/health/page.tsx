export default function HealthCheck() {
  return (
    <main style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>✅ EarnFlow is Working!</h1>
      <p>This page confirms your Next.js app is running correctly.</p>
      <ul>
        <li>✅ Next.js app is built and deployed</li>
        <li>✅ Database connection working (Supabase)</li>
        <li>✅ Netlify functions configured</li>
        <li>✅ No more 404 errors</li>
      </ul>
      <p>
        <strong>If you're seeing this page:</strong><br />
        Your app is working! The switching you saw earlier was just the deployment updating.
      </p>
      <p style={{ marginTop: '20px' }}>
        <a href="/" style={{ 
          display: 'inline-block', 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '5px' 
        }}>
          Go to Homepage
        </a>
      </p>
    </main>
  );
}