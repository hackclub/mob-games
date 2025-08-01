import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { BackgroundCanvas } from '../components/BackgroundCanvas';

// Function to generate lamp grid elements
const generateLampGrid = (containerWidth) => {
  const lampSize = 32; // Half the size of other tiles (32px instead of 64px)
  const cols = Math.floor(containerWidth / lampSize);
  const rows = Math.floor(cols / 2) * 2; // 2:1 aspect ratio but twice as tall
  
  const elements = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      elements.push({
        id: `lamp-${row}-${col}`,
        x: col * lampSize,
        y: row * lampSize
      });
    }
  }
  
  return elements;
};

export default function App() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // 'success' or 'error'
  const [stageOpen, setStageOpen] = useState(0); // Controls which stage dropdown is open
  const [lampElements, setLampElements] = useState([]);
  const [hoveredLamp, setHoveredLamp] = useState(null);
  const [litLamps, setLitLamps] = useState(new Set());
  const [rippleLamps, setRippleLamps] = useState(new Set());
  const [animationStates, setAnimationStates] = useState({
    header: false,
    lamps: false,
    stage0: false,
    stage1: false,
    stage2: false,
    stage3: false
  });
  const [motd, setMotd] = useState(null);
  const [motdError, setMotdError] = useState(null);
  
  // Audio files for each stage
  const stageAudio = {
    0: '/stage_00001.mp3',
    1: '/stage_00002.mp3', 
    2: '/stage_00003.mp3',
    3: '/stage_00004.mp3'
  };

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

  // Generate lamp grid when component mounts
  useEffect(() => {
    const containerWidth = 800; // Same width as the stages container
    const lampGrid = generateLampGrid(containerWidth);
    setLampElements(lampGrid);
  }, []);

  // Staged animations
  useEffect(() => {
    if (!isLoading && userData) {
      const timers = [
        setTimeout(() => setAnimationStates(prev => ({ ...prev, header: true })), 100),

        setTimeout(() => setAnimationStates(prev => ({ ...prev, stage0: true })), 101),
        setTimeout(() => setAnimationStates(prev => ({ ...prev, stage1: true })), 102),
        setTimeout(() => setAnimationStates(prev => ({ ...prev, stage2: true })), 103),
        setTimeout(() => setAnimationStates(prev => ({ ...prev, stage3: true })), 104)
      ];

      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [isLoading, userData]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Fetch Minecraft MOTD for mob-games.hackclub.com
  useEffect(() => {
    let cancelled = false;
    async function fetchMotd() {
      try {
        console.log('Fetching MOTD...');
        // Try a different API endpoint
        const res = await fetch('https://api.mcsrvstat.us/2/a.selfhosted.hackclub.com');
        if (!res.ok) throw new Error('Failed to fetch MOTD');
        const data = await res.json();
        console.log('MOTD response:', data);
        
        if (!cancelled) {
          if (data.online) {
            // Try different possible MOTD formats
            const motdText = data.motd?.clean || data.motd?.html || data.motd || 'No MOTD available';
            setMotd(Array.isArray(motdText) ? motdText.join(' ') : motdText);
          } else {
            setMotd('Server is offline');
          }
        }
      } catch (e) {
        console.error('MOTD fetch error:', e);
        if (!cancelled) setMotdError('Could not fetch server status: ' + e.message);
      }
    }
    fetchMotd();
    return () => { cancelled = true; };
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

  const playButtonSound = () => {
    const audio = new Audio('/minecraft-button.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success message
      setMessage({ text: 'Server address copied to clipboard!', type: 'success' });
      console.log('URL copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setMessage({ text: 'Failed to copy to clipboard', type: 'error' });
    }
  };

  const handleLampHover = (index) => {
    setHoveredLamp(index);
    setLitLamps(prev => new Set([...prev, index]));
  };

  const handleLampLeave = (index) => {
    setHoveredLamp(null);
    // Wait 1 second before turning off
    setTimeout(() => {
      setLitLamps(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 1000);
  };

  const createRippleEffect = (clickedIndex) => {
    const cols = Math.floor(800 / 32);
    const clickedRow = Math.floor(clickedIndex / cols);
    const clickedCol = clickedIndex % cols;
    
    // Calculate distances for all lamps from the clicked point
    const distances = lampElements.map((element, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const distance = Math.sqrt(
        Math.pow(row - clickedRow, 2) + Math.pow(col - clickedCol, 2)
      );
      return { index, distance };
    });
    
    // Sort by distance to create ripple effect
    distances.sort((a, b) => a.distance - b.distance);
    
    // Create ripple animation
    distances.forEach(({ index }, rippleIndex) => {
      setTimeout(() => {
        setRippleLamps(prev => new Set([...prev, index]));
        
        // Turn off after a short delay
        setTimeout(() => {
          setRippleLamps(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
        }, 300);
      }, rippleIndex * 50); // 50ms delay between each ring
    });
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
      
      {/* Three.js Background Canvas - Isolated from main component re-renders */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <BackgroundCanvas />
      </div>
      
      {/* Conditional Audio Element */}
      {stageOpen >= 0 && stageOpen <= 3 && (
        <audio
          src={stageAudio[stageOpen]}
          autoPlay
          loop
          preload="auto"
        />
      )}
      
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        padding: '20px'
      }}>
                <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            opacity: animationStates.header ? 1 : 0,
            transform: animationStates.header ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'opacity 0.1s ease, transform 0.1s ease'
          }}>
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

          {/* Lamp Grid */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '384px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            {lampElements.map((element, index) => {
              const isHovered = hoveredLamp === index;
              const isLit = litLamps.has(index);
              const isRippling = rippleLamps.has(index);
              const shouldBeOn = isHovered || isLit || isRippling;
              
              return (
                <div
                  key={element.id}
                  style={{
                    position: 'absolute',
                    left: element.x,
                    top: element.y,
                    width: '32px',
                    height: '32px',
                    backgroundImage: `url("${shouldBeOn ? '/redstone_lamp_on.png' : '/redstone_lamp_off.png'}")`,
                    backgroundSize: '32px 32px',
                    backgroundRepeat: 'no-repeat',
                    imageRendering: 'pixelated',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => handleLampHover(index)}
                  onMouseLeave={() => handleLampLeave(index)}
                  onClick={() => createRippleEffect(index)}
                />
              );
            })}
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
          `,
          opacity: animationStates.stage0 ? 1 : 0,
          transform: animationStates.stage0 ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.1s ease, transform 0.1s ease'
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
              <p>Stage 0: Setup & understand the game</p>
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
                <p>What's your minecraft username? (this will be used to add you to the whitelist of the server once your mod is approved)</p>
                
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
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>Hey, Thomas here!</p>

              <p>Mob games is a game jam where you can build your own mod and ship it to our server.</p>
              <p>You cannot build just any mod though, it must be a mod that adds one mob to the game. Your mod cannot do anything other than add 1 creature to our game (no custom items, biomes, or other features)</p>
              <p>What type of mob you may ask? Well, that's up to you!</p>
              <p>You can make a mob that is vicious and aggressive, one that you could tame and ride, or one that delivers valuable loot. You could even make one that is a boss. In your mod you should ensure that the mob will naturally spawn in the world in places that make sense.</p>
              <p>Currently the server is in sandbox mode where you can go and explore, but during August 6th & 7th the server will reset and the Mob Games will begin.</p>
              <p>In the mob games, you have only one life. If you die in the game, you're out. Your objective is to get as many points (1 kill = 1 point) as you can. The player who has the most kills by the end is the winner.</p>
              <p>The server will be running on a modded version of Minecraft 1.20.1. You can download the mod pack at stage 3 (feel free to do this at any time).</p>
              <p>Now's the time to headover to Stage 1 and get started building your mod! It's totally okay if you're a beginner, this is intended for you (as well as though super experienced).</p>
              </div>
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
          `,
          opacity: animationStates.stage1 ? 1 : 0,
          transform: animationStates.stage1 ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.1s ease, transform 0.1s ease'
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
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', marginBottom: '12px', fontFamily: 'Minecraft, monospace' }}>Prerequisites</h3>
                  
                  <h4 style={{ color: '#555', marginBottom: '8px', fontFamily: 'Minecraft, monospace' }}>Required Software</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <a 
                      href="https://www.oracle.com/java/technologies/downloads/#java21" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#FF5555',
                        color: '#FFFFFF',
                        padding: '4px 8px',
                        fontFamily: 'Minecraft, monospace',
                        fontSize: '12px',
                        border: '1px solid #000000',
                        textShadow: '1px 1px 0px #000000',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#FF7777'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#FF5555'}
                    >
                      Java 21
                    </a>
                    <a 
                      href="https://www.jetbrains.com/idea/download/#section=community" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#5555FF',
                        color: '#FFFFFF',
                        padding: '4px 8px',
                        fontFamily: 'Minecraft, monospace',
                        fontSize: '12px',
                        border: '1px solid #000000',
                        textShadow: '1px 1px 0px #000000',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#7777FF'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#5555FF'}
                    >
                      IntelliJ IDEA Community Edition
                    </a>
                    <a 
                      href="https://plugins.jetbrains.com/plugin/8327-minecraft-development" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#FFAA00',
                        color: '#000000',
                        padding: '4px 8px',
                        fontFamily: 'Minecraft, monospace',
                        fontSize: '12px',
                        border: '1px solid #000000',
                        textShadow: '1px 1px 0px #FFFFFF',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#FFCC44'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#FFAA00'}
                    >
                      Minecraft Development Plugin
                    </a>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', marginBottom: '12px', fontFamily: 'Minecraft, monospace' }}>Setup Steps</h3>
                  
                  <h4 style={{ color: '#555', marginBottom: '8px', fontFamily: 'Minecraft, monospace' }}>Install IntelliJ IDEA Community Edition</h4>
                  <p style={{ color: '#333', marginBottom: '8px' }}>Download from JetBrains website (Make sure to get the Community Edition at the bottom)</p>
                  
                  <h4 style={{ color: '#555', marginBottom: '8px', fontFamily: 'Minecraft, monospace' }}>Install Minecraft Development Plugin</h4>
                  <ol style={{ marginLeft: '20px', color: '#333' }}>
                    <li>Open IntelliJ IDEA</li>
                    <li>Click on the little settings icon on the left bottom corner</li>
                    <li>Search for Plugins on the left sidebar</li>
                    <li>Search for "Minecraft Development"</li>
                    <li>Install the plugin</li>
                    <li>Restart IntelliJ IDEA</li>
                  </ol>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', marginBottom: '12px', fontFamily: 'Minecraft, monospace' }}>Project Setup</h3>
                  
                  <h4 style={{ color: '#555', marginBottom: '8px', fontFamily: 'Minecraft, monospace' }}>1. Create New Fabric Project</h4>
                  <ol style={{ marginLeft: '20px', color: '#333' }}>
                    <li>Open IntelliJ IDEA</li>
                    <li>Click New Project</li>
                    <li>Select Minecraft from the left panel</li>
                    <li>Choose Fabric as the platform</li>
                    <li>Configure project settings:
                      <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                        <li>Name: MyCustomMob</li>
                        <li>Minecraft Version: 1.20.1</li>
                        <li>Group ID: dev.example</li>
                        <li>Yarn Mappings: Use recommended version</li>
                        <li>Fabric Loader: Use latest version</li>
                        <li>Fabric API: Use latest version</li>
                      </ul>
                    </li>
                    <li>JDK: Click the dropdown and find "Download JDK"
                      <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                        <li>Click it, on version select "21"</li>
                        <li>Click Download</li>
                      </ul>
                    </li>
                    <li>Click Create</li>
                  </ol>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#FFFFFF', marginBottom: '12px', fontFamily: 'Minecraft, monospace', textShadow: '1px 1px 0px #000000' }}>Helpful Resources</h3>
                  
                  {/* VSTACK: Videos on top, Documentation below */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* HSTACK: Video Tutorials side by side */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ 
                        backgroundColor: '#C6C6C6', 
                        padding: '16px', 
                        border: '2px solid #000000',
                        flex: '1',
                        minWidth: '300px'
                      }}>
                        <h4 style={{ color: '#000000', marginBottom: '12px', fontFamily: 'Minecraft, monospace' }}>Fabric Mod Development Tutorial</h4>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', border: '2px solid #000000' }}>
                          <iframe
                            src="https://www.youtube.com/embed/0Pr_iHlVKsI?si=QVbLej-niMidgs7B"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none'
                            }}
                            title="Fabric Mod Development Tutorial"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                      
                      <div style={{ 
                        backgroundColor: '#C6C6C6', 
                        padding: '16px', 
                        border: '2px solid #000000',
                        flex: '1',
                        minWidth: '300px'
                      }}>
                        <h4 style={{ color: '#000000', marginBottom: '12px', fontFamily: 'Minecraft, monospace' }}>Advanced Fabric Modding</h4>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', border: '2px solid #000000' }}>
                          <iframe
                            src="https://www.youtube.com/embed/wgVnkqqBGFs"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none'
                            }}
                            title="Advanced Fabric Modding"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    </div>

                    {/* HSTACK: Documentation Links side by side */}
                    <div style={{ 
                      backgroundColor: '#C6C6C6', 
                      padding: '16px', 
                      border: '2px solid #000000'
                    }}>
                      <h4 style={{ color: '#000000', marginBottom: '12px', fontFamily: 'Minecraft, monospace' }}>Documentation</h4>
                      
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <a 
                          href="https://fabricmc.net/wiki/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            flex: '1',
                            padding: '8px 12px',
                            backgroundColor: '#55FF55',
                            color: '#000000',
                            textDecoration: 'none',
                            fontFamily: 'Minecraft, monospace',
                            fontSize: '14px',
                            border: '2px solid #000000',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '150px',
                            minHeight: '40px'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#7FFF7F'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#55FF55'}
                        >
                          Fabric Wiki
                        </a>
                        
                        <a 
                          href="https://linkie.shedaniel.me/mappings" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            flex: '1',
                            padding: '8px 12px',
                            backgroundColor: '#5555FF',
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            fontFamily: 'Minecraft, monospace',
                            fontSize: '14px',
                            border: '2px solid #000000',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '150px',
                            minHeight: '40px'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#7F7FFF'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#5555FF'}
                        >
                          Yarn Mappings
                        </a>
                        
                        <a 
                          href="https://blockbench.net/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            flex: '1',
                            padding: '8px 12px',
                            backgroundColor: '#FFAA00',
                            color: '#000000',
                            textDecoration: 'none',
                            fontFamily: 'Minecraft, monospace',
                            fontSize: '14px',
                            border: '2px solid #000000',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '150px',
                            minHeight: '40px'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#FFCC44'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#FFAA00'}
                        >
                          Blockbench - For 3D model creation
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
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
          `,
          opacity: animationStates.stage2 ? 1 : 0,
          transform: animationStates.stage2 ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.1s ease, transform 0.1s ease'
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
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p>Stage two is to ship your mod to the server! There are two parts to this:</p>
                  
                  <p><strong>First:</strong> Open a pull request (title feat: add {"{mod name}"} mod) to the github repo where you can add your mod to the mod pack (the jar folder): <a href="https://github.com/hackclub/mob-games/tree/main/serverpack/mods" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>https://github.com/hackclub/mob-games/tree/main/serverpack/mods</a></p>
                  
                  <p><strong>Second:</strong> Fill out this form which will add your project to the review queue:</p>
                  
                  <div style={{ position: 'relative', margin: '20px 0' }}>
                    {/* Sparkle GIFs around the button */}
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '-40px',
                      width: '32px',
                      height: '32px',
                      backgroundImage: 'url("/purple_sparkle.gif")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      filter: 'hue-rotate(240deg) brightness(1.2)',
                      zIndex: 1
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-35px',
                      width: '28px',
                      height: '28px',
                      backgroundImage: 'url("/purple_sparkle.gif")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      filter: 'hue-rotate(240deg) brightness(1.1)',
                      zIndex: 1
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-25px',
                      left: '-30px',
                      width: '30px',
                      height: '30px',
                      backgroundImage: 'url("/purple_sparkle.gif")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      filter: 'hue-rotate(240deg) brightness(1.3)',
                      zIndex: 1
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-35px',
                      right: '-25px',
                      width: '35px',
                      height: '35px',
                      backgroundImage: 'url("/purple_sparkle.gif")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      filter: 'hue-rotate(240deg) brightness(1.0)',
                      zIndex: 1
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '-50px',
                      transform: 'translateY(-50%)',
                      width: '25px',
                      height: '25px',
                      backgroundImage: 'url("/purple_sparkle.gif")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      filter: 'hue-rotate(240deg) brightness(1.4)',
                      zIndex: 1
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      right: '-45px',
                      transform: 'translateY(-50%)',
                      width: '27px',
                      height: '27px',
                      backgroundImage: 'url("/purple_sparkle.gif")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      filter: 'hue-rotate(240deg) brightness(1.2)',
                      zIndex: 1
                    }} />
                    
                    <button 
                      onClick={() => {
                        playButtonSound();
                        window.open('https://forms.hackclub.com/t/gtceynBziuus', '_blank');
                      }}
                      style={{
                        height: '56px',
                        width: '100%',
                        margin: '0 auto',
                        display: 'block',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        background: '#9C27B0',
                        border: '3px solid #000',
                        fontFamily: 'Minecraft, Courier New, monospace',
                        fontSize: '22px',
                        outline: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        transition: 'all 0.1s ease',
                        position: 'relative',
                        zIndex: 2
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#BA68C8';
                        e.currentTarget.querySelector('.title').style.backgroundColor = 'rgba(100, 100, 255, 0.45)';
                        e.currentTarget.querySelector('.title').style.textShadow = '2px 2px #202013CC';
                        e.currentTarget.querySelector('.title').style.color = '#FFFFA0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#9C27B0';
                        e.currentTarget.querySelector('.title').style.backgroundColor = 'transparent';
                        e.currentTarget.querySelector('.title').style.textShadow = '2px 2px #000A';
                        e.currentTarget.querySelector('.title').style.color = '#DDD';
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.querySelector('.title').style.boxShadow = 'inset -2px -4px #0004, inset 2px 2px #FFF5';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.querySelector('.title').style.boxShadow = 'inset -2px -4px #0006, inset 2px 2px #FFF7';
                      }}
                    >
                      <div 
                        className="title"
                        style={{
                          width: '100%',
                          height: '100%',
                          paddingBottom: '0.3em',
                          paddingTop: '0.2em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#DDD',
                          textShadow: '2px 2px #000A',
                          boxShadow: 'inset -2px -4px #0006, inset 2px 2px #FFF7',
                          textAlign: 'center',
                          lineHeight: '1'
                        }}
                      >
                        Ship Mod
                      </div>
                    </button>
                  </div>
                  
                  <p>Once your mod is approved, your PR will be merged and you'll be able to play on the server for the Mob Games!</p>
                </div>
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
          `,
          opacity: animationStates.stage3 ? 1 : 0,
          transform: animationStates.stage3 ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.1s ease, transform 0.1s ease'
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
                <p>Join the server at <span 
                  onClick={() => copyToClipboard('mob-games.hackclub.com')}
                  title="Click to copy server address"
                  style={{
                    color: '#0066cc',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    userSelect: 'none',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#0088ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#0066cc';
                  }}
                >mob-games.hackclub.com</span> <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>(click to copy)</span></p>
                

                <div style={{ 
                  margin: '16px 0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  background: 'url(https://motd.gg/assets/css/minecraft-background-160x-ANFX4M6O.png)',
                  backgroundSize: '40px 40px',
                  backgroundPosition: 'center',
                  border: '2px solid #333',
                  position: 'relative'
                }}>
                  {/* Dark overlay for better text readability */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.3)'
                  }}></div>
                  
                  {/* Online indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '16px',
                    height: '16px',
                    background: '#4CAF50',
                    borderRadius: '50%',
                    border: '2px solid #2E7D32',
                    boxShadow: '0 0 8px #4CAF50, inset 0 0 4px #66BB6A',
                    zIndex: 2,
                    animation: 'pulse 2s ease-in-out infinite'
                  }}></div>
                  
                  {/* Ripple effect */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid #4CAF50',
                    zIndex: 1,
                    animation: 'ripple 2s ease-out infinite'
                  }}></div>
                  
                  <style jsx>{`
                    @keyframes pulse {
                      0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                      }
                      50% {
                        transform: scale(1.1);
                        opacity: 0.8;
                      }
                    }
                    
                    @keyframes ripple {
                      0% {
                        transform: scale(1);
                        opacity: 1;
                      }
                      100% {
                        transform: scale(3);
                        opacity: 0;
                      }
                    }
                  `}</style>
                  
                  {/* Server Icon */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    flexShrink: 0,
                    position: 'relative',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '2px solid #555',
                    zIndex: 1
                  }}>
                    <img 
                      src="/MobGamesLogo.png" 
                      alt="Minecraft server icon"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'pixelated'
                      }}
                    />
                  </div>
                  
                  {/* Server Text Content */}
                  <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                    {/* Server Name */}
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '8px',
                      fontFamily: 'Minecraft, monospace',
                      textShadow: '1px 1px 0px #000000'
                    }}>
                      Mob Games
                    </div>
                    
                    {/* MOTD Content */}
                    <div style={{
                      fontSize: '14px',
                      lineHeight: '1.4',
                      color: '#ffffff',
                      fontFamily: 'Minecraft, monospace',
                      wordBreak: 'break-word',
                      textShadow: '1px 1px 0px #000000'
                    }}>
                      {motd && (
                        <span style={{ color: '#ffff55' }}>
                          {motd}
                        </span>
                      )}
                      
                      {motdError && (
                        <span style={{ color: '#ff5555' }}>
                          {motdError}
                        </span>
                      )}
                      
                      {!motd && !motdError && (
                        <span style={{ color: '#cccccc' }}>
                          Loading server status...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Server Schedule */}
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#2a2a2a', border: '2px solid #555', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#ffffff', textShadow: '1px 1px 0px #000' }}>Server Schedule:</p>
                  <p style={{ margin: '4px 0', color: '#ffffff', textShadow: '1px 1px 0px #000' }}><strong style={{ color: '#ffaa00' }}>August 1st - August 5th:</strong> Sandbox Mode (experiment)</p>
                  <p style={{ margin: '4px 0', color: '#ffffff', textShadow: '1px 1px 0px #000' }}><strong style={{ color: '#ffaa00' }}>August 6th & 7th:</strong> Mob Games Begin</p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
} 
