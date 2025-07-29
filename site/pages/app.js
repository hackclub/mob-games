import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function App() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // 'success' or 'error'

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/accessUserData');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          // Set the current Minecraft username in the input if it exists
          if (data.airtable && data.airtable.minecraftUsername) {
            setMinecraftUsername(data.airtable.minecraftUsername);
          }
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

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

  const handleUpdateMinecraftUsername = async (e) => {
    e.preventDefault();
    
    if (!minecraftUsername.trim()) {
      setMessage({ text: 'Please enter a Minecraft username', type: 'error' });
      return;
    }

    setIsUpdating(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch('/api/user/updateUserMinecraftAccount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minecraftUsername }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ text: 'Minecraft username updated successfully!', type: 'success' });
        // Refresh user data to show the updated username
        const userResponse = await fetch('/api/user/accessUserData');
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUserData(data);
        }
      } else {
        const error = await response.json();
        setMessage({ text: `Failed to update Minecraft username: ${error.message}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error updating Minecraft username:', error);
      setMessage({ text: 'Failed to update Minecraft username', type: 'error' });
    } finally {
      setIsUpdating(false);
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
        <p>slack name: {userData.slack.name}!</p>
        {userData.slack.avatar && (
          <img 
            src={userData.slack.avatar} 
            alt="Profile" 
            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
          />
        )}
        <p>Slack ID: {userData.slack.slackId}</p>
        {userData.airtable && userData.airtable.minecraftUsername && (
          <p>mc username: {userData.airtable.minecraftUsername}</p>
        )}        
        <p>hello world</p>
        
        {message.text && (
          <div style={{
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleUpdateMinecraftUsername}>
          <input
            type="text"
            value={minecraftUsername}
            onChange={(e) => setMinecraftUsername(e.target.value)}
            placeholder="Enter your Minecraft username"
          />
          <button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Minecraft Username'}
          </button>
        </form>
        
        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );
} 