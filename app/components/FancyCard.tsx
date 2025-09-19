"use client";
import React, { useState } from 'react';

interface Card {
  name: string;
  attack: number;
  defense: number;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageCid?: string;
  createdAt?: string;
}

interface FancyCardProps {
  card: Card;
  revealed?: boolean;
  customImageUrl?: string;
}

const DEFAULT_CARD_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 280'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='280' fill='url(%23grad)' rx='12'/%3E%3Ctext x='100' y='140' text-anchor='middle' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3E%3F%3C/text%3E%3C/svg%3E";

export const FancyCard: React.FC<FancyCardProps> = ({ card, revealed = true, customImageUrl }) => {
  const [isHovered, setIsHovered] = useState(false);

  const rarityColors = {
    common: { primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' },
    rare: { primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' },
    epic: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
    legendary: { primary: '#f59e0b', secondary: '#fbbf24', accent: '#fcd34d' }
  };

  const colors = rarityColors[card.rarity];
  const cardImage = customImageUrl || 
    (card.imageCid 
      ? `/api/blob?cid=${encodeURIComponent(card.imageCid)}`
      : DEFAULT_CARD_IMAGE);

  if (!revealed) {
    return (
      <div className="card-wrapper">
        <div className="card mystery-card">
          <div className="card-back">
            <div className="mystery-pattern"></div>
            <div className="mystery-text">?</div>
          </div>
        </div>
        <style jsx>{`
          .card-wrapper {
            perspective: 1000px;
            width: 200px;
            height: 280px;
          }
          
          .card {
            width: 100%;
            height: 100%;
            border-radius: 12px;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.3s ease;
            cursor: pointer;
          }
          
          .mystery-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 2px solid #4c1d95;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          }
          
          .card-back {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
          
          .mystery-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            animation: shimmer 3s ease-in-out infinite;
          }
          
          .mystery-text {
            font-size: 48px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1;
          }
          
          @keyframes shimmer {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="card-wrapper">
      <div 
        className={`card fancy-card ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="card-inner">
          <div className="holographic-layer"></div>
          <div className="card-content">
            <div className="card-header">
              <h3 className="card-name">{card.name}</h3>
              <div className="rarity-badge">{card.rarity}</div>
            </div>
            
            <div className="card-image-container">
              <img 
                src={cardImage}
                alt={card.name}
                className="card-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_CARD_IMAGE;
                }}
              />
              <div className="image-overlay"></div>
            </div>
            
            <div className="card-stats">
              <div className="stat-row">
                <span className="stat-label">Type</span>
                <span className="stat-value">{card.type}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">ATK</span>
                <span className="stat-value attack">{card.attack}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">DEF</span>
                <span className="stat-value defense">{card.defense}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .card-wrapper {
          perspective: 1000px;
          width: 200px;
          height: 280px;
        }
        
        .fancy-card {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          position: relative;
          transform-style: preserve-3d;
          transition: all 0.3s ease;
          cursor: pointer;
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%);
          border: 2px solid ${colors.primary};
          box-shadow: 
            0 4px 15px rgba(0,0,0,0.2),
            0 0 20px rgba(${colors.primary === '#f59e0b' ? '245, 158, 11' : 
                              colors.primary === '#8b5cf6' ? '139, 92, 246' :
                              colors.primary === '#3b82f6' ? '59, 130, 246' : '107, 114, 128'}, 0.3);
        }
        
        .fancy-card.hovered {
          transform: rotateY(5deg) rotateX(5deg) translateY(-5px);
          box-shadow: 
            0 15px 35px rgba(0,0,0,0.3),
            0 0 30px rgba(${colors.primary === '#f59e0b' ? '245, 158, 11' : 
                              colors.primary === '#8b5cf6' ? '139, 92, 246' :
                              colors.primary === '#3b82f6' ? '59, 130, 246' : '107, 114, 128'}, 0.5);
        }
        
        .card-inner {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, 
            rgba(255,255,255,0.1) 0%, 
            rgba(255,255,255,0.05) 50%, 
            rgba(0,0,0,0.1) 100%);
        }
        
        .holographic-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%),
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(0,255,255,0.1) 0%, transparent 50%);
          opacity: ${isHovered ? '0.8' : '0.4'};
          transition: opacity 0.3s ease;
          animation: holo-shift 3s ease-in-out infinite;
          mix-blend-mode: overlay;
        }
        
        .card-content {
          position: relative;
          z-index: 2;
          padding: 12px;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .card-name {
          font-size: 14px;
          font-weight: bold;
          margin: 0;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
          line-height: 1.2;
          max-width: 120px;
        }
        
        .rarity-badge {
          background: rgba(0,0,0,0.6);
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255,255,255,0.3);
        }
        
        .card-image-container {
          flex: 1;
          position: relative;
          margin: 8px 0;
          border-radius: 6px;
          overflow: hidden;
          background: rgba(0,0,0,0.2);
        }
        
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(255,255,255,0.1) 0%, 
            transparent 30%, 
            transparent 70%, 
            rgba(0,0,0,0.1) 100%);
          pointer-events: none;
        }
        
        .card-stats {
          background: rgba(0,0,0,0.4);
          border-radius: 6px;
          padding: 8px;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .stat-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 12px;
        }
        
        .stat-row:last-child {
          margin-bottom: 0;
        }
        
        .stat-label {
          font-weight: 600;
          opacity: 0.9;
        }
        
        .stat-value {
          font-weight: bold;
        }
        
        .stat-value.attack {
          color: #ff6b6b;
        }
        
        .stat-value.defense {
          color: #4ecdc4;
        }
        
        @keyframes holo-shift {
          0%, 100% {
            background-position: 0% 0%, 30% 30%, 70% 70%;
          }
          25% {
            background-position: 100% 0%, 40% 20%, 60% 80%;
          }
          50% {
            background-position: 100% 100%, 20% 40%, 80% 60%;
          }
          75% {
            background-position: 0% 100%, 10% 50%, 90% 50%;
          }
        }
      `}</style>
    </div>
  );
};