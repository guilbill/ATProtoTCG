"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/session', { credentials: 'same-origin' });
        const data = await res.json();
        if (res.ok && data.loggedIn) {
          router.push('/');
        }
      } catch {
        // ignore
      }
    })();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Process identifier to add .bsky.social if needed
    let processedIdentifier = identifier.trim();
    
    // If identifier doesn't contain a dot (simple username) or is missing .bsky.social, add it
    if (!processedIdentifier.includes('.')) {
      processedIdentifier = `${processedIdentifier}.bsky.social`;
    } else if (!processedIdentifier.endsWith('.bsky.social') && !processedIdentifier.includes('@')) {
      // Handle case where user entered something like "guilbill.bsky" but not the full domain
      if (processedIdentifier.endsWith('.bsky')) {
        processedIdentifier = `${processedIdentifier}.social`;
      } else if (!processedIdentifier.includes('.bsky.social')) {
        processedIdentifier = `${processedIdentifier}.bsky.social`;
      }
    }
    
    try {
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: processedIdentifier, password }),
        credentials: 'same-origin',
      });
      
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || 'Login failed');
      
      // Redirect to main page on successful login
      router.push('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
          AT-Proto Card Game
        </h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>
              Bluesky Handle
            </label>
            <input
              type="text"
              placeholder="username (or full handle)"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '0.25rem', display: 'block' }}>
              Just enter your username - we&apos;ll add .bsky.social automatically
            </small>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>
              App Password
            </label>
            <input
              type="password"
              placeholder="App password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          {error && (
            <div style={{ 
              color: '#dc3545', 
              marginTop: '1rem',
              padding: '0.5rem',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}