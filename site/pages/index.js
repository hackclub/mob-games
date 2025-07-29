
import { useState, useEffect } from 'react';
import Head from 'next/head';

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
    <>
      <Head>
        <link rel="preload" href="https://i.ibb.co/rb2TWXL/bgbtn.png" as="image" />
      </Head>
      <div className="main-container">
        {isBookOpen && (
          <div className="book-overlay" onClick={closeBook}>
            <div className="book-background" onClick={(e) => e.stopPropagation()}>
              <img src="/bookBG.png" alt="Book" className="book-image" />
            </div>
          </div>
        )}
        
        <img
          src="/videoMinecraft.gif"
          className="background-image"
          alt="Minecraft background"
        />
        <div className="content-container">
          <div className="logo-container">
            <img
              src="/ModdedLogo.png"
              className="logo-image"
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
    </>
  );
}
