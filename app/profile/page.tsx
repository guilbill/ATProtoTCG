"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ATProtoRecord {
  uri: string;
  cid: string;
  value: Record<string, unknown>;
  createdAt?: string;
}

interface ProfileData {
  did: string;
  profile?: {
    displayName?: string;
    handle: string;
    description?: string;
    avatar?: string;
    banner?: string;
    followersCount?: number;
    followsCount?: number;
    postsCount?: number;
  };
  records: Record<string, ATProtoRecord[]>;
  totalCollections: number;
  totalRecords: number;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'same-origin'
        });

        if (response.status === 401) {
          router.push('/');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getCollectionDisplayName = (collection: string) => {
    const names: Record<string, string> = {
      'app.bsky.feed.post': 'Posts',
      'app.bsky.feed.like': 'Likes',
      'app.bsky.feed.repost': 'Reposts',
      'app.bsky.graph.follow': 'Following',
      'app.bsky.graph.block': 'Blocks',
      'app.bsky.actor.profile': 'Profile',
      'app.tcg.card': 'TCG Cards',
    };
    return names[collection] || collection;
  };

  const renderRecordValue = (value: Record<string, unknown>, collection: string) => {
    if (!value) return null;

    // Helper to safely render unknown values as strings
    const safeString = (val: unknown): string => {
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return val.toString();
      if (val === null || val === undefined) return '';
      return String(val);
    };

    // Helper to safely access nested properties
    const safeGet = (obj: unknown, key: string): unknown => {
      if (obj && typeof obj === 'object' && key in obj) {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    };

    switch (collection) {
      case 'app.bsky.feed.post':
        const reply = safeGet(value, 'reply');
        const embed = safeGet(value, 'embed');
        const replyParent = reply ? safeGet(reply, 'parent') : undefined;
        const replyParentUri = replyParent ? safeGet(replyParent, 'uri') : undefined;
        
        return (
          <div className="record-content">
            <p><strong>Text:</strong> {safeString(value.text) || 'No text'}</p>
            {reply ? <p><strong>Reply to:</strong> {safeString(replyParentUri)}</p> : null}
            {embed ? <p><strong>Has embed:</strong> {safeString(safeGet(embed, '$type'))}</p> : null}
          </div>
        );
      
      case 'app.tcg.card':
        return (
          <div className="record-content">
            <p><strong>Name:</strong> {safeString(value.name)}</p>
            <p><strong>Attack:</strong> {safeString(value.attack)} | <strong>Defense:</strong> {safeString(value.defense)}</p>
            <p><strong>Type:</strong> {safeString(value.type)} | <strong>Rarity:</strong> {safeString(value.rarity)}</p>
          </div>
        );
      
      case 'app.bsky.graph.follow':
        return (
          <div className="record-content">
            <p><strong>Following:</strong> {safeString(value.subject)}</p>
          </div>
        );
      
      case 'app.bsky.feed.like':
        const subject = safeGet(value, 'subject');
        const subjectUri = subject ? safeGet(subject, 'uri') : undefined;
        
        return (
          <div className="record-content">
            <p><strong>Liked:</strong> {safeString(subjectUri)}</p>
          </div>
        );
      
      case 'app.bsky.actor.profile':
        return (
          <div className="record-content">
            <p><strong>Display Name:</strong> {safeString(value.displayName) || 'None'}</p>
            <p><strong>Description:</strong> {safeString(value.description) || 'None'}</p>
          </div>
        );
      
      default:
        return (
          <div className="record-content">
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        );
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
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        color: 'red'
      }}>
        Error: {error}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'sans-serif'
      }}>
        No profile data found
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'sans-serif',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, color: '#333' }}>AT-Proto Profile</h1>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
        
        {profileData.profile && (
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: '#333' }}>
              {profileData.profile.displayName || profileData.profile.handle}
            </h2>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>@{profileData.profile.handle}</p>
            {profileData.profile.description && (
              <p style={{ color: '#666' }}>{profileData.profile.description}</p>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <span><strong>Followers:</strong> {profileData.profile.followersCount || 0}</span>
              <span><strong>Following:</strong> {profileData.profile.followsCount || 0}</span>
              <span><strong>Posts:</strong> {profileData.profile.postsCount || 0}</span>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', fontSize: '14px', color: '#666' }}>
          <span><strong>DID:</strong> {profileData.did}</span>
          <span><strong>Collections:</strong> {profileData.totalCollections}</span>
          <span><strong>Total Records:</strong> {profileData.totalRecords}</span>
        </div>
      </div>

      {/* Collections Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {Object.entries(profileData.records).map(([collection, records]) => (
          <div
            key={collection}
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              border: selectedCollection === collection ? '2px solid #3b82f6' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setSelectedCollection(selectedCollection === collection ? null : collection)}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
              {getCollectionDisplayName(collection)}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>
              {records.length} record{records.length !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>

      {/* Selected Collection Details */}
      {selectedCollection && profileData.records[selectedCollection] && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>
            {getCollectionDisplayName(selectedCollection)} Records
          </h2>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {profileData.records[selectedCollection].map((record, index) => (
              <div
                key={record.uri}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>
                    Record #{index + 1}
                  </small>
                  {record.createdAt && (
                    <small style={{ color: '#6b7280', fontSize: '12px' }}>
                      {formatTimestamp(record.createdAt)}
                    </small>
                  )}
                </div>
                
                {renderRecordValue(record.value, selectedCollection)}
                
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '12px' }}>
                    Technical Details
                  </summary>
                  <div style={{ marginTop: '0.5rem', fontSize: '11px', color: '#6b7280' }}>
                    <p><strong>URI:</strong> {record.uri}</p>
                    <p><strong>CID:</strong> {record.cid}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .record-content p {
          margin: 0.25rem 0;
          font-size: 14px;
        }
        
        .record-content pre {
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 4px;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}