"use client";

import { Admin, Resource } from 'react-admin';
import { atprotoDataProvider } from '../../lib/dataProvider';
import CloudIcon from '@mui/icons-material/Cloud';
import CollectionsIcon from '@mui/icons-material/Collections';
import DescriptionIcon from '@mui/icons-material/Description';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import resources
import { BlobList, BlobShow } from './resources/blobs';
import { CollectionList, CollectionShow } from './resources/collections';
import { RecordList, RecordShow } from './resources/records';

// Authentication check component
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/session');
        const data = await response.json();
        setIsAuthenticated(data.loggedIn);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'sans-serif'
      }}>
        <div>
          <h2>Loading...</h2>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>Authentication Required</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            You need to be logged in to access the admin interface.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push('/profile')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Main Admin component
const AdminApp = () => (
  <AuthCheck>
    <Admin dataProvider={atprotoDataProvider} title="AT-Proto Admin">
      <Resource
        name="blobs"
        list={BlobList}
        show={BlobShow}
        icon={CloudIcon}
        options={{ label: 'Blobs' }}
      />
      <Resource
        name="collections"
        list={CollectionList}
        show={CollectionShow}
        icon={CollectionsIcon}
        options={{ label: 'Collections' }}
      />
      <Resource
        name="records"
        list={RecordList}
        show={RecordShow}
        icon={DescriptionIcon}
        options={{ label: 'Records' }}
      />
    </Admin>
  </AuthCheck>
);

export default AdminApp;