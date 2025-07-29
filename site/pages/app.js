import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function App() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          // Redirect to login if not authenticated
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear server-side cookies
      await fetch('/api/logout', { method: 'POST' });
      
      // Clear client-side cookies
      document.cookie = 'userData=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      document.cookie = 'userData=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userData=; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Redirect to homepage
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout API fails
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return <div></div>;
  }

  if (!userData) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      <Head>
        <title>App - Mob Games</title>
      </Head>
      <div>
        <h1>Welcome to Mob Games!</h1>
        <p>Hello {userData.name}!</p>
        {userData.avatar && (
          <img 
            src={userData.avatar} 
            alt="Profile" 
            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
          />
        )}
        <p>Slack ID: {userData.slackId}</p>
        <p>hello world</p>
        
        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );
} 