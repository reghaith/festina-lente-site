'use client';

import { useEffect } from 'react';

export default function ErrorPage() {
  useEffect(() => {
    // Log error details
    console.error('Registration Error Details:', {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <main style={{ 
      padding: '50px', 
      fontFamily: 'Arial, sans-serif', 
      textAlign: 'center',
      marginTop: '100px'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        padding: '30px', 
        border: '1px solid #ff6b6b', 
        borderRadius: '8px', 
        backgroundColor: '#fff8f8'
      }}>
        <h1 style={{ 
          color: '#d32f2f', 
          marginBottom: '20px' 
        }}>Registration Failed</h1>
        
        <h3 style={{ color: '#666', marginBottom: '15px' }}>Something went wrong</h3>
        
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <strong>Error:</strong> Server responded with status 500 (Internal Server Error)
        </div>
        
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <strong>What happened:</strong> Our system encountered an unexpected error while processing your registration.
        </div>
        
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <strong>What to do:</strong> 
          <ul>
            <li>Try registering again in a few minutes</li>
            <li>Contact support if the problem persists</li>
            <li>We've been notified and will fix this issue</li>
          </ul>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            onClick={() => window.location.href = '/register'}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <small style={{ color: '#666' }}>
          Error Code: REG-500 | Time: {new Date().toLocaleString()}
        </small>
      </div>
    </main>
  );
}