import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function App() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // 'success' or 'error'
  const [stageOpen, setStageOpen] = useState(0); // Controls which stage dropdown is open

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

  const playButtonSound = () => {
    const audio = new Audio('/minecraft-button.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const toggleStage = (stageNumber) => {
    playButtonSound();
    setStageOpen(stageOpen === stageNumber ? -1 : stageNumber);
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
      {/* 
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
      */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#3d4863',
        overflow: 'auto',
        padding: '20px'
      }}>
                <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: 'white', margin: 0 }}>Welcome to Mob Games!</p>
            <button 
              onClick={handleLogout}
              style={{
                height: '32px',
                padding: '0 12px',
                backgroundColor: '#8b8b8b',
                color: '#DDD',
                border: '2px solid #000',
                fontFamily: 'Minecraft, Courier New, monospace',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                transition: 'all 0.1s ease',
                textShadow: '1px 1px #000A',
                boxShadow: 'inset -1px -2px #0006, inset 1px 1px #FFF7'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#a1a1a1';
                e.currentTarget.style.textShadow = '1px 1px #202013CC';
                e.currentTarget.style.color = '#FFFFA0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#8b8b8b';
                e.currentTarget.style.textShadow = '1px 1px #000A';
                e.currentTarget.style.color = '#DDD';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = 'inset -1px -2px #0004, inset 1px 1px #FFF5';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = 'inset -1px -2px #0006, inset 1px 1px #FFF7';
              }}
            >
              Logout
            </button>
          </div>
        
        <div style={{ 
          marginBottom: '10px',
          display: 'grid',
          gridTemplateColumns: '2px 2px auto 2px 2px',
          gridTemplateRows: '2px 2px auto 2px 2px',
          gridTemplateAreas: `
            "tl-tl tr-tl t tl-tr tr-tr"
            "bl-tl br-tl t bl-tr br-tr"
            "l l inv r r"
            "tl-bl tr-bl b tl-br tr-br"
            "bl-bl br-bl b bl-br br-br"
          `
        }}>
          {/* Border elements */}
          <div style={{ gridArea: 'tl-tl', backgroundColor: '#ffffff', position: 'relative', bottom: '-4px', right: '-4px' }}></div>
          <div style={{ gridArea: 'tr-tl', backgroundColor: '#ffffff' }}></div>
          <div style={{ gridArea: 'br-tl', backgroundColor: '#ffffff' }}></div>
          <div style={{ gridArea: 'bl-tl', backgroundColor: '#ffffff' }}></div>
          
          <div style={{ gridArea: 'bl-tr', backgroundColor: '#c6c6c6' }}></div>
          <div style={{ gridArea: 'tr-bl', backgroundColor: '#c6c6c6' }}></div>
          
          <div style={{ gridArea: 'tr-br', backgroundColor: '#555555' }}></div>
          <div style={{ gridArea: 'tl-br', backgroundColor: '#555555' }}></div>
          <div style={{ gridArea: 'bl-br', backgroundColor: '#555555' }}></div>
          
          <div style={{ gridArea: 't', backgroundColor: '#ffffff', boxShadow: '0 -2px 0 black' }}></div>
          <div style={{ gridArea: 'l', backgroundColor: '#ffffff', boxShadow: '-2px 0 0 black' }}></div>
          <div style={{ gridArea: 'r', backgroundColor: '#555555', boxShadow: '2px 0 0 black' }}></div>
          <div style={{ gridArea: 'b', backgroundColor: '#555555', boxShadow: '0 2px 0 black' }}></div>
          
          <div style={{ gridArea: 'inv', backgroundColor: '#c6c6c6', padding: '16px', cursor: stageOpen === 0 ? 'default' : 'pointer' }} onClick={() => toggleStage(0)}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Stage 0: Setup & understand the game 
              <img 
                src={userData?.airtable?.minecraftUsername ? `https://mc-heads.net/avatar/${userData.airtable.minecraftUsername}` : "/items/book.png"}
                alt={userData?.airtable?.minecraftUsername ? "Minecraft Avatar" : "Book"}
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  imageRendering: 'pixelated',
                  transform: stageOpen === 0 ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>
            {stageOpen === 0 && (
              <div style={{ paddingTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                <p>What's your minecraft username?</p>
                
                {message.text && (
                  <div style={{
                    padding: '10px',
                    margin: '10px 0',
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
                    style={{
                      padding: '8px',
                      marginRight: '10px',
                      border: '2px inset #8b8b8b',
                      backgroundColor: '#8b8b8b',
                      boxShadow: 'inset 2px 2px 0 0 #373737, inset -2px -2px 0 0 #ffffff',
                      fontFamily: 'Minecraft, Courier New, monospace',
                      fontSize: '16px'
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    style={{
                      height: '40px',
                      padding: '0 16px',
                      backgroundColor: isUpdating ? '#8b8b8b' : '#4CAF50',
                      color: '#DDD',
                      border: '3px solid #000',
                      fontFamily: 'Minecraft, Courier New, monospace',
                      fontSize: '16px',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                      transition: 'all 0.1s ease',
                      textShadow: '2px 2px #000A',
                      boxShadow: 'inset -2px -4px #0006, inset 2px 2px #FFF7'
                    }}
                    onMouseEnter={(e) => {
                      if (!isUpdating) {
                        e.currentTarget.style.background = '#66BB6A';
                        e.currentTarget.style.textShadow = '2px 2px #202013CC';
                        e.currentTarget.style.color = '#FFFFA0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isUpdating) {
                        e.currentTarget.style.background = '#4CAF50';
                        e.currentTarget.style.textShadow = '2px 2px #000A';
                        e.currentTarget.style.color = '#DDD';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!isUpdating) {
                        e.currentTarget.style.boxShadow = 'inset -2px -4px #0004, inset 2px 2px #FFF5';
                      }
                    }}
                    onMouseUp={(e) => {
                      if (!isUpdating) {
                        e.currentTarget.style.boxShadow = 'inset -2px -4px #0006, inset 2px 2px #FFF7';
                      }
                    }}
                  >
                    {isUpdating ? 'Updating...' : 'Update Username'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          marginBottom: '10px',
          display: 'grid',
          gridTemplateColumns: '2px 2px auto 2px 2px',
          gridTemplateRows: '2px 2px auto 2px 2px',
          gridTemplateAreas: `
            "tl-tl tr-tl t tl-tr tr-tr"
            "bl-tl br-tl t bl-tr br-tr"
            "l l inv r r"
            "tl-bl tr-bl b tl-br tr-br"
            "bl-bl br-bl b bl-br br-br"
          `
        }}>
          {/* Border elements */}
          <div style={{ gridArea: 'tl-tl', backgroundColor: '#ffffff', position: 'relative', bottom: '-4px', right: '-4px' }}></div>
          <div style={{ gridArea: 'tr-tl', backgroundColor: '#ffffff' }}></div>
          <div style={{ gridArea: 'br-tl', backgroundColor: '#ffffff' }}></div>
          <div style={{ gridArea: 'bl-tl', backgroundColor: '#ffffff' }}></div>
          
          <div style={{ gridArea: 'bl-tr', backgroundColor: '#c6c6c6' }}></div>
          <div style={{ gridArea: 'tr-bl', backgroundColor: '#c6c6c6' }}></div>
          
          <div style={{ gridArea: 'tr-br', backgroundColor: '#555555' }}></div>
          <div style={{ gridArea: 'tl-br', backgroundColor: '#555555' }}></div>
          <div style={{ gridArea: 'bl-br', backgroundColor: '#555555' }}></div>
          
          <div style={{ gridArea: 't', backgroundColor: '#ffffff', boxShadow: '0 -2px 0 black' }}></div>
          <div style={{ gridArea: 'l', backgroundColor: '#ffffff', boxShadow: '-2px 0 0 black' }}></div>
          <div style={{ gridArea: 'r', backgroundColor: '#555555', boxShadow: '2px 0 0 black' }}></div>
          <div style={{ gridArea: 'b', backgroundColor: '#555555', boxShadow: '0 2px 0 black' }}></div>
          
          <div style={{ gridArea: 'inv', backgroundColor: '#c6c6c6', padding: '16px', cursor: stageOpen === 1 ? 'default' : 'pointer' }} onClick={() => toggleStage(1)}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Stage 1: Build your mod 
              <img 
                src="/items/crafting_table.png" 
                alt="Crafting Table" 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  imageRendering: 'pixelated',
                  transform: stageOpen === 1 ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>
            {stageOpen === 1 && (
              <div style={{ paddingTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                <p>Content for how to build your mod will go here... (cc: @leafd)</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          marginBottom: '10px',
          display: 'grid',
          gridTemplateColumns: '2px 2px auto 2px 2px',
          gridTemplateRows: '2px 2px auto 2px 2px',
          gridTemplateAreas: `
            "tl-tl tr-tl t tl-tr tr-tr"
            "bl-tl br-tl t bl-tr br-tr"
            "l l inv r r"
            "tl-bl tr-bl b tl-br tr-br"
            "bl-bl br-bl b bl-br br-br"
          `
        }}>
          {/* Border elements */}
          <div style={{ gridArea: 'tl-tl', backgroundColor: '#ffffff', position: 'relative', bottom: '-4px', right: '-4px' }}></div>
          <div style={{ gridArea: 'tr-tl', backgroundColor: '#ffffff' }}></div>
          <div style={{ gridArea: 'br-tl', backgroundColor: '#ffffff' }}></div>
          <div style={{ gridArea: 'bl-tl', backgroundColor: '#ffffff' }}></div>
          
          <div style={{ gridArea: 'bl-tr', backgroundColor: '#c6c6c6' }}></div>
          <div style={{ gridArea: 'tr-bl', backgroundColor: '#c6c6c6' }}></div>
          
          <div style={{ gridArea: 'tr-br', backgroundColor: '#555555' }}></div>
          <div style={{ gridArea: 'tl-br', backgroundColor: '#555555' }}></div>
          <div style={{ gridArea: 'bl-br', backgroundColor: '#555555' }}></div>
          
          <div style={{ gridArea: 't', backgroundColor: '#ffffff', boxShadow: '0 -2px 0 black' }}></div>
          <div style={{ gridArea: 'l', backgroundColor: '#ffffff', boxShadow: '-2px 0 0 black' }}></div>
          <div style={{ gridArea: 'r', backgroundColor: '#555555', boxShadow: '2px 0 0 black' }}></div>
          <div style={{ gridArea: 'b', backgroundColor: '#555555', boxShadow: '0 2px 0 black' }}></div>
          
          <div style={{ gridArea: 'inv', backgroundColor: '#c6c6c6', padding: '16px', cursor: stageOpen === 2 ? 'default' : 'pointer' }} onClick={() => toggleStage(2)}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Stage 2: Ship your mod 
              <img 
                src="/items/paper.png" 
                alt="Paper" 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  imageRendering: 'pixelated',
                  transform: stageOpen === 2 ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>
            {stageOpen === 2 && (
              <div style={{ paddingTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                <p>Content for Stage 2 will go here...</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          marginBottom: '10px',
          display: 'grid',
          gridTemplateColumns: '2px 2px auto 2px 2px',
          gridTemplateRows: '2px 2px auto 2px 2px',
          gridTemplateAreas: `
            "tl-tl tr-tl t tl-tr tr-tr"
            "bl-tl br-tl t bl-tr br-tr"
            "l l inv r r"
            "tl-bl tr-bl b tl-br tr-br"
            "bl-bl br-bl b bl-br br-br"
          `
        }}>
          {/* Border elements */}
          <div style={{ gridArea: 'tl-tl', backgroundColor: '#ffffff', position: 'relative', bottom: '-4px', right: '-4px' }}></div>
          <div style={{ gridArea: 'tr-tl', backgroundColor: '#ffffff' }}></div>
          <div style={{ gridArea: 'br-tl', backgroundColor: '#ffffff' }}></div>
          <div style={{ gridArea: 'bl-tl', backgroundColor: '#ffffff' }}></div>
          
          <div style={{ gridArea: 'bl-tr', backgroundColor: '#c6c6c6' }}></div>
          <div style={{ gridArea: 'tr-bl', backgroundColor: '#c6c6c6' }}></div>
          
          <div style={{ gridArea: 'tr-br', backgroundColor: '#555555' }}></div>
          <div style={{ gridArea: 'tl-br', backgroundColor: '#555555' }}></div>
          <div style={{ gridArea: 'bl-br', backgroundColor: '#555555' }}></div>
          
          <div style={{ gridArea: 't', backgroundColor: '#ffffff', boxShadow: '0 -2px 0 black' }}></div>
          <div style={{ gridArea: 'l', backgroundColor: '#ffffff', boxShadow: '-2px 0 0 black' }}></div>
          <div style={{ gridArea: 'r', backgroundColor: '#555555', boxShadow: '2px 0 0 black' }}></div>
          <div style={{ gridArea: 'b', backgroundColor: '#555555', boxShadow: '0 2px 0 black' }}></div>
          
          <div style={{ gridArea: 'inv', backgroundColor: '#c6c6c6', padding: '16px', cursor: stageOpen === 3 ? 'default' : 'pointer' }} onClick={() => toggleStage(3)}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Stage 3: Play on the server 
              <img 
                src="/items/sword.png" 
                alt="Sword" 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  imageRendering: 'pixelated',
                  transform: stageOpen === 3 ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>
            {stageOpen === 3 && (
              <div style={{ paddingTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                <p>Content for Stage 3 will go here...</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
} 