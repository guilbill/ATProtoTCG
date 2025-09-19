
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Card {
  name: string;
  attack: number;
  defense: number;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageCid?: string;
  createdAt?: string;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadCards = async () => {
      try {
        // Check if logged in
        const sessionRes = await fetch('/api/session', { credentials: 'same-origin' });
        const sessionData = await sessionRes.json();
        
        if (!sessionRes.ok || !sessionData.loggedIn) {
          router.push('/login');
          return;
        }
        
        setIdentifier(sessionData.identifier || '');
        
        // Load cards
        const cardsRes = await fetch('/api/cards', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          credentials: 'same-origin' 
        });
        const cardsData = await cardsRes.json();
        
        if (cardsRes.ok) {
          setCards(cardsData.cards);
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadCards();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      // ignore errors, just redirect
      router.push('/login');
    }
  };

  const openBooster = () => {
    router.push('/booster');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'sans-serif'
      }}>
        Loading...
      </div>
    );
  }

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
        <h1 style={{ margin: 0, color: '#333' }}>My Collection</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>Welcome, {identifier}</span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Open Booster Button */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={openBooster}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Open Booster
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {cards.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#666',
            padding: '3rem',
            fontSize: '18px'
          }}>
            No cards in your collection yet.<br />
            Open a booster to get started!
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            {cards.map((card, i) => (
              <div 
                key={i} 
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  backgroundColor: '#fafafa',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {card.imageCid && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <img 
                      src={`/api/blob?cid=${encodeURIComponent(card.imageCid)}`} 
                      alt={card.name} 
                      style={{ 
                        width: '100%', 
                        borderRadius: '6px',
                        aspectRatio: '3/4',
                        objectFit: 'cover'
                      }} 
                    />
                  </div>
                )}
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '16px' }}>{card.name}</h3>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <div>Type: {card.type}</div>
                  <div>Attack: {card.attack}</div>
                  <div>Defense: {card.defense}</div>
                  <div style={{ 
                    textTransform: 'capitalize',
                    color: card.rarity === 'legendary' ? '#ff6b35' : 
                           card.rarity === 'epic' ? '#8b5cf6' :
                           card.rarity === 'rare' ? '#3b82f6' : '#6b7280'
                  }}>
                    {card.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
