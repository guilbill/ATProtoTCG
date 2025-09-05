"use client"

import React, { useState } from 'react';

const IMAGE_DIR = '/MAGIC%20React%20Admin/';

export default function BoosterPage() {
  const [cards, setCards] = useState<string[]>([]);
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

  function openBooster() {
    // pick two distinct random images
    if (images.length < 2) return;
    const first = images[Math.floor(Math.random() * images.length)];
    let second = images[Math.floor(Math.random() * images.length)];
    // ensure distinct
    let attempts = 0;
    while (second === first && attempts < 8) {
      second = images[Math.floor(Math.random() * images.length)];
      attempts++;
    }
    setCards([first, second]);
  }

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  // check session on mount
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/session', { credentials: 'same-origin' });
        const d = await res.json();
        if (res.ok && d.loggedIn) {
          setLoggedIn(true);
          setIdentifier(d.identifier || '');
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

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

  async function saveBooster() {
    if (!loggedIn && (!identifier || !password)) {
      setStatus('Please provide identifier and app password to save cards.');
      return;
    }
    if (cards.length === 0) {
      setStatus('Open a booster first.');
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      setSavedCount(0);
      for (const c of cards) {
        const imageUrl = `${IMAGE_DIR}${encodeURIComponent(c)}`;
        setStatus(`Uploading ${c}...`);
        const imageBase64 = await fetchImageAsBase64(imageUrl);
        const name = c.replace(/\.JPEG$/i, '').replace(/_/g, ' ');
        const cardPayload = {
          name,
          attack: randomStat(),
          defense: randomStat(),
          type: 'magic',
          rarity: randomRarity(),
          imageBase64,
        };
        // If not loggedIn we still send identifier/password (login fallback)
        const res = await fetch('/api/create-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ identifier: loggedIn ? undefined : identifier, password: loggedIn ? undefined : password, card: cardPayload }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Failed to save card');
        setSavedCount((s) => s + 1);
      }
      setStatus('Booster saved to your AT-Proto collection.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setStatus(msg);
    } finally {
      setSaving(false);
    }
  }

  async function doLogin() {
    if (!identifier || !password) return setStatus('Please enter credentials');
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Login failed');
      setLoggedIn(true);
      setStatus('Logged in');
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : 'Login failed');
    }
  }

  function validateIdentifier(id: string) {
    const v = id.trim();
    // Accept common patterns: contains dot (e.g. 'name.bsky.social') or an @ handle
    return v.length > 0 && (v.includes('.') || v.includes('@'));
  }

  const identifierValid = validateIdentifier(identifier);
  const passwordValid = password.trim().length > 0;
  const canSave = cards.length > 0 && identifierValid && passwordValid && !saving;

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 700, margin: '2rem auto' }}>
      <h2>Open a Booster</h2>
      <p>Each booster contains 2 random cards from the MAGIC collection.</p>
      <button onClick={openBooster} style={{ padding: '0.6rem 1rem', fontSize: 16 }} disabled={saving}>
        Open Booster
      </button>

      <div style={{ marginTop: 12 }}>
        <input
          placeholder="Bluesky identifier (e.g. name.bsky.social)"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8, boxSizing: 'border-box' }}
          disabled={saving}
        />
        {!identifierValid && identifier.length > 0 && (
          <div style={{ color: '#b33', fontSize: 12, marginBottom: 8 }}>Identifier looks invalid (use name.bsky.social or @handle)</div>
        )}
        <input
          placeholder="App password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8, boxSizing: 'border-box' }}
          disabled={saving}
        />

        <button onClick={saveBooster} disabled={!canSave} style={{ padding: '0.6rem 1rem', width: '100%' }}>
          {saving ? `Saving... (${savedCount}/${cards.length})` : 'Save Booster to AT-Proto'}
        </button>
        {status && <div style={{ marginTop: 8, color: status.startsWith('Booster saved') ? 'green' : '#b33' }}>{status}</div>}
      </div>

      {cards.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {cards.map((c, i) => (
            <div key={i} style={{ width: '50%', border: '1px solid #ddd', padding: 8, borderRadius: 8, background: '#fff' }}>
              <img src={`${IMAGE_DIR}${encodeURIComponent(c)}`} alt={c} style={{ width: '100%', height: 'auto', borderRadius: 6 }} />
              <div style={{ marginTop: 8, fontSize: 12, color: '#444' }}>{c.replace(/\.JPEG$/i, '')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}