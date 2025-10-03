"use client"

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FancyCard } from '../components/FancyCard';

export type Card = {
  name: string;
  attack: number;
  defense: number;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt?: string;
  image: string;
};

export default function BoosterPage() {
  const [opened, setOpened] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  const openBooster = async () => {
    if (saving) return;
    setOpened(true);
    setSaving(true);
    setStatus('Adding cards to your collection...');
    try {

        const res = await fetch('/api/booster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save card');
      
      
      setStatus('Cards added! Returning to collection...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch {
      router.push('/login');
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
          {[0,1,2].map((card, i) => (
            <FancyCard
              key={i}
            />
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