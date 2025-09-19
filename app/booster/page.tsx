"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const IMAGE_DIR = '/MAGIC%20React%20Admin/';

export default function BoosterPage() {
  const [cards, setCards] = useState<string[]>([]);
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
  async function fetchImageAsBase64(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch image ' + url);
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const chunk = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
    }
    return btoa(binary);
  }

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
        const imageUrl = `${IMAGE_DIR}${encodeURIComponent(cardImage)}`;
        const imageBase64 = await fetchImageAsBase64(imageUrl);
        const name = cardImage.replace(/\.JPEG$/i, '').replace(/_/g, ' ');
        const cardPayload = {
          name,
          attack: randomStat(),
          defense: randomStat(),
          type: 'magic',
          rarity: randomRarity(),
          imageBase64,
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
          {cards.map((cardImage, i) => (
            <div 
              key={i} 
              style={{ 
                width: '200px',
                border: '2px solid #ddd',
                borderRadius: '12px',
                padding: '1rem',
                backgroundColor: opened ? '#fff' : '#e9ecef',
                transition: 'all 0.3s ease',
                transform: opened ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {opened ? (
                <>
                  <img 
                    src={`${IMAGE_DIR}${encodeURIComponent(cardImage)}`} 
                    alt={cardImage} 
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px',
                      aspectRatio: '3/4',
                      objectFit: 'cover'
                    }} 
                  />
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {cardImage.replace(/\.JPEG$/i, '').replace(/_/g, ' ')}
                  </div>
                </>
              ) : (
                <div style={{
                  height: '240px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#6c757d',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  ?
                </div>
              )}
            </div>
          ))}
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