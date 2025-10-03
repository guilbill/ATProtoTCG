"use client";
import React, { useState, useRef } from 'react';
import './pokemonCardEffect.css';

interface Card {
  name: string;
  attack: number;
  defense: number;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt?: string;
  image?: string; // For booster pack static images
  imageCid?: string | { toString(): string }; // For uploaded AT-Proto blob CIDs - can be string or CID object
}

interface FancyCardProps {
  card: Card;
  revealed?: boolean;
}

export const FancyCard: React.FC<FancyCardProps> = ({ card, revealed = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const rarityColors = {
    common: { primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' },
    rare: { primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' },
    epic: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
    legendary: { primary: '#f59e0b', secondary: '#fbbf24', accent: '#fcd34d' }
  };

  const colors = rarityColors[card.rarity];

  // Helper function to check if card has an image
  const hasImage = () => !!(card.imageCid || card.image);

  // Helper function to get card background
  const getCardBackground = () => {
    if (card.imageCid) {
      // AT-Proto blob image - handle both string and CID object
      let cidString = card.imageCid;
      
      // If it's a CID object, extract the string
      if (typeof cidString === 'object' && cidString && 'toString' in cidString) {
        cidString = cidString.toString();
      }
      
      // Remove CID() wrapper if present
      if (typeof cidString === 'string') {
        cidString = cidString.replace(/^CID\((.+)\)$/, '$1');
        return `url(/api/blob?cid=${cidString})`;
      }
    }
    
    // Fallback gradient
    return `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const rotateX = (y - 50) * 0.1;
    const rotateY = (50 - x) * 0.1;
    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.02, 1.02, 1.02)
    `;
    cardRef.current.style.setProperty('--pointer-x', `${x}%`);
    cardRef.current.style.setProperty('--pointer-y', `${y}%`);
    cardRef.current.style.setProperty('--card-opacity', '0.8');
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    cardRef.current.style.setProperty('--pointer-x', '50%');
    cardRef.current.style.setProperty('--pointer-y', '50%');
    cardRef.current.style.setProperty('--card-opacity', '0.6');
  };

  if (!revealed) {
    return (
      <div 
        ref={cardRef}
        className="card-container card-back"
        style={{
          width: '280px',
          height: '400px',
          margin: '1rem',
          perspective: '1000px',
          transition: 'all 0.3s ease'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
      >
        <div className="card-inner" style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '15px',
          background: `linear-gradient(135deg, #2d3748, #4a5568)`,
          boxShadow: isHovered 
            ? '0 25px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)' 
            : '0 15px 35px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>
          ?
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="card-container fancy-card-effect"
      style={{
        width: '240px',
        height: '360px',
        margin: '1rem',
        perspective: '1000px',
        transition: 'all 0.3s ease',
        '--card-primary': colors.primary,
        '--card-secondary': colors.secondary,
        '--card-accent': colors.accent,
        background: getCardBackground(),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: '3px solid #bfa76a',
        boxShadow: '0 0 32px 0 #000, 0 0 12px 2px #bfa76a inset',
        filter: 'drop-shadow(0 0 8px #bfa76a)',
      } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
    >
      <div className="card-inner" style={{position: 'relative', width: '100%', height: '100%'}}>
        <div className="card-face card-front" style={{width: '100%', height: '100%'}}>
          {/* Overlays now cover the whole card */}
          <div className="image-overlay" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', borderRadius: '15px', pointerEvents: 'none'}}></div>
          <div className="shine" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', borderRadius: '15px', pointerEvents: 'none'}}></div>
          <div className="glare" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', borderRadius: '15px', pointerEvents: 'none'}}></div>
        </div>
      </div>
    </div>
  );
};