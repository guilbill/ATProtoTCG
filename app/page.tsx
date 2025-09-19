
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FancyCard } from './components/FancyCard';

interface Card {
  name: string;
  attack: number;
  defense: number;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt?: string;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [deleting, setDeleting] = useState(false);
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
        } else if (cardsRes.status === 401) {
          // Session expired, clear the session cookie and redirect to login
          document.cookie = 'atp_session=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          router.push('/login');
          return;
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

  const handleDeleteAllCards = async () => {
    if (!confirm('Are you sure you want to delete ALL your cards? This cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    try {
      const response = await fetch('/api/cards', { 
        method: 'DELETE',
        credentials: 'same-origin' 
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setCards([]); // Clear the cards from the UI
        alert(result.message || 'All cards deleted successfully');
      } else {
        alert(result.error || 'Failed to delete cards');
      }
    } catch (error) {
      alert('Error deleting cards: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeleting(false);
    }
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
            onClick={() => router.push('/profile')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Profile
          </button>
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginRight: '1rem'
          }}
        >
          Open Booster
        </button>
        
        <button
          onClick={handleDeleteAllCards}
          disabled={deleting || cards.length === 0}
          style={{
            padding: '1rem 2rem',
            backgroundColor: deleting ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: deleting || cards.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            opacity: deleting || cards.length === 0 ? 0.6 : 1
          }}
        >
          {deleting ? 'Deleting...' : 'Delete All Cards'}
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '2rem',
            justifyItems: 'center'
          }}>
            {cards.map((card, i) => (
              <FancyCard key={i} card={card} revealed={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
