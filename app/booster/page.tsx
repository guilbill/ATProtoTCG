"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FancyCard } from '../components/FancyCard';

export default function BoosterPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ did: string; handle: string; } | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();
  
  const images = [
    'ADRIEN.JPEG',
    'ANNIVERSARY.JPEG', 
    'ANY.JPEG',
    'CAMARCHE.JPEG',
    'CODESANDBOX.JPEG',
    'CONTRETOUS.JPEG',
    'FRANCOIS.JPEG',
    'GATSBY.JPEG',
    'GILDAS.JPEG',
    'JEREMIE.JPEG',
    'MUI.JPEG',
    'PROFESSIONALSERVICES.JPEG',
  ];

  // Check auth on mount
  useEffect(() => {
    // Get session ID from cookie
    const getSessionId = () => {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('atp_session='));
      return sessionCookie ? sessionCookie.split('=')[1].trim() : null;
    };
    
    setSessionId(getSessionId());
    checkAuth();
    generateBoosterCards();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/session', { credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok || !data.loggedIn) {
        router.push('/login');
      }
    } catch (e) {
      router.push('/login');
    }
  };

  const generateBoosterCards = () => {
    // Generate 3 distinct random cards
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setCards(shuffled.slice(0, 3));
  };

  // helper: convert image URL to base64 (no data: prefix)
  function randomStat() {
    return Math.floor(Math.random() * 10) + 1; // 1..10
  }

  function randomRarity() {
    const list = ['common', 'rare', 'epic', 'legendary'];
    return list[Math.floor(Math.random() * list.length)];
  }

  const openBooster = async () => {
    if (saving) return;
    
    setOpened(true);
    setSaving(true);
    setStatus('Adding cards to your collection...');
    
    try {
      let savedCount = 0;
      for (const cardImage of cards) {
        const name = cardImage.replace(/\.JPEG$/i, '').replace(/_/g, ' ');
        const cardPayload = {
          name,
          attack: randomStat(),
          defense: randomStat(),
          type: 'magic',
          rarity: randomRarity(),
        };

        const res = await fetch('/api/create-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ card: cardPayload }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save card');
        savedCount++;
        setStatus(`Saved ${savedCount}/${cards.length} cards...`);
      }
      
      setStatus('Cards added! Returning to collection...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setStatus(`Error: ${msg}`);
      setSaving(false);
    }
  };

  const goBack = () => {
    router.push('/');
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'sans-serif',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>Booster Pack</h1>
        <button 
          onClick={goBack}
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          Back to Collection
        </button>
      </div>

      {/* Booster Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          {opened ? 'Your New Cards!' : 'Ready to Open?'}
        </h2>
        
        {/* Cards Display */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '3rem',
          flexWrap: 'wrap'
        }}>
          {cards.map((cardImage, i) => {
            // Create a temporary card object for display
            const displayCard = {
              name: cardImage.replace(/\.JPEG$/i, '').replace(/_/g, ' '),
              attack: Math.floor(Math.random() * 10) + 1,
              defense: Math.floor(Math.random() * 10) + 1,
              type: 'magic',
              rarity: (['common', 'rare', 'epic', 'legendary'] as const)[Math.floor(Math.random() * 4)]
            };
            
            return (
              <FancyCard 
                key={i} 
                card={displayCard} 
                revealed={opened}
              />
            );
          })}
        </div>

        {/* Action Button */}
        {!opened && (
          <button
            onClick={openBooster}
            disabled={saving}
            style={{
              padding: '1rem 3rem',
              backgroundColor: saving ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '20px',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {saving ? 'Opening...' : 'Open'}
          </button>
        )}

        {/* Status Message */}
        {status && (
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: status.startsWith('Error') ? '#f8d7da' : '#d4edda',
            border: `1px solid ${status.startsWith('Error') ? '#f5c6cb' : '#c3e6cb'}`,
            borderRadius: '4px',
            color: status.startsWith('Error') ? '#721c24' : '#155724'
          }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}