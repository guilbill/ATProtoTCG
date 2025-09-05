"use client";
import React, { useEffect, useState } from 'react';

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
  // cleaned: manual card creation state removed (use Booster page)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // POST to /api/login to set session cookie
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
        credentials: 'same-origin',
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || 'Login failed');
      // fetch cards via session-backed /api/cards
  const res = await fetch('/api/cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' });
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

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      // ignore network errors
    }
    setLoggedIn(false);
    setCards([]);
    setIdentifier('');
    setPassword('');
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    // check session on mount
    (async () => {
      try {
  const s = await fetch('/api/session', { credentials: 'same-origin' });
        const sd = await s.json();
        if (s.ok && sd.loggedIn) {
          setIdentifier(sd.identifier || '');
          setLoggedIn(true);
          const r = await fetch('/api/cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' });
          const rd = await r.json();
          if (r.ok) setCards(rd.cards);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Your Cards</h3>
            <button onClick={handleLogout} style={{ padding: '6px 10px', fontSize: 14 }} disabled={loading}>{loading ? 'Please wait...' : 'Logout'}</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <p style={{ color: '#444' }}>Card creation moved to the Booster page — open a booster there to create cards.</p>
          </div>
          {cards.length === 0 ? (
            <div>No cards found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {cards.map((card, i) => (
                <div key={i} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, background: '#fafafa' }}>
                  {/** render image if present */}
                  {('imageCid' in card) && (card as any).imageCid && (
                    <div style={{ marginBottom: 8 }}>
                      <img src={`/api/blob?cid=${encodeURIComponent((card as any).imageCid)}`} alt={card.name} style={{ width: '100%', borderRadius: 6 }} />
                    </div>
                  )}
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
