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
  const [name, setName] = useState('');
  const [attack, setAttack] = useState(1);
  const [defense, setDefense] = useState(1);
  const [typeField, setTypeField] = useState('');
  const [rarityField, setRarityField] = useState<'common'|'rare'|'epic'|'legendary'>('common');
  const [imageFile, setImageFile] = useState<File | null>(null);

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
          <div style={{ marginTop: 12 }}>
            <h4>Create Card</h4>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ width: '100%', marginBottom: 8 }} />
            <input type="number" value={attack} onChange={e => setAttack(Number(e.target.value))} placeholder="Attack" style={{ width: '100%', marginBottom: 8 }} />
            <input type="number" value={defense} onChange={e => setDefense(Number(e.target.value))} placeholder="Defense" style={{ width: '100%', marginBottom: 8 }} />
            <input value={typeField} onChange={e => setTypeField(e.target.value)} placeholder="Type" style={{ width: '100%', marginBottom: 8 }} />
            <select value={rarityField} onChange={e => setRarityField(e.target.value as 'common'|'rare'|'epic'|'legendary')} style={{ width: '100%', marginBottom: 8 }}>
              <option value="common">common</option>
              <option value="rare">rare</option>
              <option value="epic">epic</option>
              <option value="legendary">legendary</option>
            </select>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', marginBottom: 8 }} />
            <button onClick={async () => {
              if (!identifier || !password) return setError('You must be logged in');
              const cardPayload: { name: string; attack: number; defense: number; type: string; rarity: string; imageBase64?: string } = { name, attack, defense, type: typeField, rarity: rarityField };
              if (imageFile) {
                const b64 = await new Promise<string>((res, rej) => {
                  const fr = new FileReader();
                  fr.onload = () => res((fr.result as string).split(',')[1]);
                  fr.onerror = rej;
                  fr.readAsDataURL(imageFile);
                });
                cardPayload.imageBase64 = b64;
              }
              setLoading(true);
              try {
                const r = await fetch('/api/create-card', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ identifier, password, card: cardPayload }),
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || 'Create failed');
                // Refresh cards
                const res2 = await fetch('/api/cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password }) });
                const data2 = await res2.json();
                if (res2.ok) setCards(data2.cards);
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Create failed';
                setError(msg);
              } finally { setLoading(false); }
            }} style={{ width: '100%', marginTop: 8 }}>Create Card</button>
          </div>
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
