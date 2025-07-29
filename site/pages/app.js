import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function App() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
      alert('Please enter a Minecraft username');
      return;
    }

    setIsUpdating(true);
    
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
        alert('Minecraft username updated successfully!');
        // Refresh user data to show the updated username
        const userResponse = await fetch('/api/user/accessUserData');
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUserData(data);
        }
      } else {
        const error = await response.json();
        alert(`Failed to update Minecraft username: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating Minecraft username:', error);
      alert('Failed to update Minecraft username');
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
        <h1>Welcome to Mob Games!</h1>
        <p>Hello {userData.slack.name}!</p>
        {userData.slack.avatar && (
          <img 
            src={userData.slack.avatar} 
            alt="Profile" 
            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
          />
        )}
        <p>Slack ID: {userData.slack.slackId}</p>
        {userData.airtable && userData.airtable.minecraftUsername && (
          <p>Minecraft Username: {userData.airtable.minecraftUsername}</p>
        )}
        <p>hello world</p>
        
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