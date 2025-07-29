
import { useState, useEffect } from 'react';
import Head from 'next/head';

// Animated Background Component
const AnimatedBackground = () => (
  <video
    className="background-image"
    autoPlay
    loop
    muted
    playsInline
    poster="/minecraftBG-poster.jpg"
  >
    <source src="/minecraftBG.webm" type="video/webm" />
    <source src="/minecraftBG.mp4" type="video/mp4" />
  </video>
);

// Title Text Component
const TitleText = () => (
  <div className="logo-container">
    <img
      src="/ModdedLogo.png"
      className="logo-image"
      alt="Modded Logo"
    />
    <p className="minecraft-text">Only Aug 1st - 7th, 2025</p>
  </div>
);

// Full Width Button Component
const FullButton = ({ onClick, children }) => (
  <button className="centered-button" onClick={onClick}>
    <div className="title">{children}</div>
  </button>
);

// Half Width Button Component
const HalfButton = ({ onClick, children }) => (
  <button className="centered-button half-width" onClick={onClick}>
    <div className="title">{children}</div>
  </button>
);

// Full Button Menu Component
const FullButtonMenu = ({ playButtonSound, openBook }) => (
  <div className="buttons-group">
    <FullButton onClick={playButtonSound}>
      Join the game
    </FullButton>

    <FullButton onClick={openBook}>
      What is this?
    </FullButton>

    <div className="button-row">
      <HalfButton onClick={playButtonSound}>
        Mobs Made
      </HalfButton>
      <HalfButton 
        onClick={() => {
          playButtonSound();
          alert('Hackers never quit');
        }}
      >
        Quit Game
      </HalfButton>
    </div>
  </div>
);

// Footer Component
const Footer = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className={`bottom-text ${!isLargeScreen ? 'mobile' : ''}`}>
      <span>Open Sourced with {"<3"}</span>
      {isLargeScreen && <span>HQ-SF Production</span>}
    </div>
  );
};

// Book Overlay Component
const BookOverlay = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="book-overlay" 
      onClick={onClose}
      onTouchEnd={onClose}
    >
      <div 
        className="book-background" 
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <img 
          src="/bookBG.png" 
          alt="Book" 
          className="book-image" 
          onClick={onClose}
          onTouchEnd={onClose}
        />
      </div>
    </div>
  );
};

// Main Content Container
const ContentContainer = ({ children }) => (
  <div className="content-container">
    {children}
  </div>
);

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
        <title>Mob Games (short experiment)</title>
        <link rel="preload" href="https://i.ibb.co/rb2TWXL/bgbtn.png" as="image" />
      </Head>
      <div className="main-container">
        <BookOverlay isOpen={isBookOpen} onClose={closeBook} />
        <AnimatedBackground />
        
        <ContentContainer>
          <TitleText />
          <FullButtonMenu playButtonSound={playButtonSound} openBook={openBook} />
        </ContentContainer>
        
        <Footer />
      </div>
    </>
  );
}
