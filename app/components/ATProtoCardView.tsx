"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const ATProtoCardView: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new main page
    router.push('/');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontFamily: 'sans-serif'
    }}>
      Redirecting...
    </div>
  );
};
