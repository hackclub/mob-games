import Head from 'next/head';
import { useState, useEffect } from 'react';
import { generateMixedTileBackground } from '../utils/tileGenerator';

export default function Login() {
  const [tileElements, setTileElements] = useState([]);

  useEffect(() => {
    // Generate mixed tile background on component mount
    const mixedPattern = generateMixedTileBackground();
    const elements = [];
    
    mixedPattern.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        elements.push({
          id: `${rowIndex}-${colIndex}`,
          tile,
          x: colIndex * 64,
          y: rowIndex * 64
        });
      });
    });
    
    setTileElements(elements);
  }, []);

  const playButtonSound = () => {
    const audio = new Audio('/minecraft-button.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const handleSlackLogin = () => {
    playButtonSound();
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/slack/callback`;
    const scope = 'users:read,users.profile:read';
    
    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    window.location.href = slackAuthUrl;
  };

  return (
    <>
      <Head>
        <title>Login - Mob Games</title>
      </Head>
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Tile background */}
        {tileElements.map((element) => (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              imageRendering: 'pixelated',
              width: '64px',
              height: '64px',
              backgroundImage: `url('${element.tile}')`,
              backgroundSize: '64px 64px',
              backgroundRepeat: 'no-repeat',
              zIndex: 1
            }}
          />
        ))}
        
        {/* Login container */}
        <div style={{
          backgroundColor: '#C6C6C6',
          padding: '20px',
          width: '400px',
          maxWidth: '100%',
          zIndex: 2,
          position: 'relative',
          color: '#3F3F3F'
        }}>
          <p style={{ marginBottom: '20px' }}>
            To participate in the Mob Games, you need to be part of the{' '}
            <span style={{ color: '#FF5555' }}>Hack Club Community</span>. If you haven't already,{' '}
            <a href="https://hackclub.com/slack" target="_blank" rel="noopener noreferrer" style={{ color: '#3F3F3F', textDecoration: 'underline' }}>
              join the slack
            </a>
          </p>
          <button 
            onClick={handleSlackLogin} 
            style={{
              height: '56px',
              width: '100%',
              margin: '0 auto',
              display: 'block',
              cursor: 'pointer',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              background: '#4CAF50',
              border: '3px solid #000',
              fontFamily: 'Minecraft, Courier New, monospace',
              fontSize: '22px',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              transition: 'all 0.1s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#66BB6A';
              e.currentTarget.querySelector('.title').style.backgroundColor = 'rgba(100, 100, 255, 0.45)';
              e.currentTarget.querySelector('.title').style.textShadow = '2px 2px #202013CC';
              e.currentTarget.querySelector('.title').style.color = '#FFFFA0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4CAF50';
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
              Login with Slack
            </div>
          </button>
        </div>
      </div>
    </>
  );
} 