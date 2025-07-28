
import { useState, useEffect } from 'react';

export default function Home() {
  const [isBookOpen, setIsBookOpen] = useState(false);
  
  const playButtonSound = () => {
    const audio = new Audio('/minecraft-button.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const openBook = () => {
    playButtonSound();
    setIsBookOpen(true);
  };

  const closeBook = () => {
    setIsBookOpen(false);
  };

  // Handle ESC key press
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && isBookOpen) {
        closeBook();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isBookOpen]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {isBookOpen && (
        <div className="book-overlay" onClick={closeBook}>
          <div className="book-background" onClick={(e) => e.stopPropagation()}>
            <img src="/bookBG.png" alt="Book" className="book-image" />
          </div>
        </div>
      )}
      <style jsx>{`
        @font-face {
          font-family: 'Minecraft';
          src: url('/fonts/Minecraft.ttf') format('truetype');
        }
        
        @keyframes pulse {
          0% { transform: rotate(-20deg) scale(0.9); }
          50% { transform: rotate(-20deg) scale(1.2); }
          100% { transform: rotate(-20deg) scale(0.9); }
        }
        
        .minecraft-text {
          font-family: 'Minecraft', monospace !important;
          font-size: 34px;
          color: #F9F632;
          text-shadow: 3px 3px 0 #494300;
          letter-spacing: 1px;
          position: absolute;
          bottom: 14px;
          right: -56px;
          white-space: nowrap;
          animation: pulse 2s ease-in-out infinite;
          pointer-events: none;
          user-select: none;
        }
        
        .logo-container {
          position: relative;
          display: inline-block;
        }
        
        .centered-button {
          height: 56px;
          width: 693px;
          margin: 0 auto;
          display: block;
          cursor: pointer;
          overflow: hidden;
          white-space: nowrap;
          user-select: none;
          background: #999 url('https://i.ibb.co/rb2TWXL/bgbtn.png') center / cover;
          image-rendering: pixelated;
          border: 3px solid #000;
          font-family: 'Minecraft', 'Courier New', monospace;
          font-size: 22px;
          outline: none;
        }
        
        .centered-button:hover .title {
          background-color: rgba(100, 100, 255, .45);
          text-shadow: 2px 2px #202013CC;
          color: #FFFFA0;
        }
        
        .centered-button:active .title {
          box-shadow: inset -2px -4px #0004, inset 2px 2px #FFF5;
        }
        
        .centered-button .title {
          width: 100%; 
          height: 100%;
          padding-bottom: .3em;
          padding-top: .2em;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #DDD;
          text-shadow: 2px 2px #000A;
          box-shadow: inset -2px -4px #0006, inset 2px 2px #FFF7;
          text-align: center;
          line-height: 1;
        }
        
        .button-row {
          display: flex;
          gap: 11px;
          justify-content: center;
          width: 693px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .centered-button.half-width {
          width: 340px;
          flex: 1;
        }
        
        .bottom-text {
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          font-family: 'Minecraft', monospace;
          font-size: 24px;
          color: #FFFFFF;
          text-shadow: 2px 2px 0 #000000;
          pointer-events: none;
          user-select: none;
        }
        
        .book-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .book-background {
          height: auto;
          width: auto;
          max-height: 80vh;
          max-width: 80vw;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .book-image {
          height: 90vh;
          width: 90vw;
          object-fit: contain;
          image-rendering: pixelated;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
        }
        
        @media (max-width: 768px) {
          .minecraft-text {
            display: none;
          }
          
          .centered-button {
            height: 40px;
            width: 90vw;
            max-width: 400px;
            font-size: 16px;
            border: 2px solid #000;
          }
          
          .button-row {
            width: 90vw;
            max-width: 400px;
            gap: 8px;
          }
          
          .centered-button.half-width {
            width: calc(50% - 4px);
          }
          
          .buttons-group {
            gap: 16px;
            margin-top: 32px;
          }
        }
        
        .buttons-group {
          display: flex;
          flex-direction: column;
          gap: 22px;
          align-items: center;
          margin-top: 45px;
        }
      `}</style>
      
      <img
        src="./videoMinecraft.gif"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
          pointerEvents: 'none',
          userSelect: 'none'
        }}
        alt="Minecraft background"
      />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        textAlign: 'center'
      }}>
        <div className="logo-container">
                      <img
              src="./ModdedLogo.png"
              style={{
                width: '1120px',
                maxWidth: '90vw',
                display: 'block',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
              alt="Modded Logo"
            />
          <p className="minecraft-text">Only Aug 1st - 7th, 2025</p>
        </div>
        <div className="buttons-group">
          <button className="centered-button" onClick={playButtonSound}>
            <div className="title">Join the game</div>
          </button>

          <button className="centered-button" onClick={openBook}>
            <div className="title">What is this?</div>
          </button>

          <div className="button-row">
            <button className="centered-button half-width" onClick={playButtonSound}>
              <div className="title">Mobs Made</div>
            </button>
            <button 
              className="centered-button half-width"
              onClick={() => {
                playButtonSound();
                alert('Hackers never quit');
              }}
            >
              <div className="title">Quit Game</div>
            </button>
          </div>
        </div>
      </div>
      <div className="bottom-text">
        <span>Open Sourced with {"<3"}</span>
        <span>HQ-SF Production</span>
      </div>
    </div>
  );
}
