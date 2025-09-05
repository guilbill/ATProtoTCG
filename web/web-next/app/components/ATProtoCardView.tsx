"use client";
import React, { useState } from 'react';

interface Card {
  name: string;
  attack: number;
  defense: number;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt?: string;
}

export const ATProtoCardView: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setCards(data.cards);
        setLoggedIn(true);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>AT-Proto Card Collection</h2>
      {!loggedIn ? (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Bluesky handle"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
            required
          />
          <input
            type="password"
            placeholder="App password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
            required
          />
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </form>
      ) : (
        <div>
          <h3>Your Cards</h3>
          {cards.length === 0 ? (
            <div>No cards found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {cards.map((card, i) => (
                <div key={i} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, background: '#fafafa' }}>
                  <strong>{card.name}</strong>
                  <div>Type: {card.type}</div>
                  <div>Attack: {card.attack}</div>
                  <div>Defense: {card.defense}</div>
                  <div>Rarity: {card.rarity}</div>
                  {card.createdAt && <div style={{ fontSize: 10, color: '#888' }}>Created: {card.createdAt}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
