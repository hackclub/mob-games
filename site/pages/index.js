
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

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
const TitleText = ({ userName, isLoggedIn }) => (
  <div className="logo-container">
    <img
      src="/ModdedLogo.png"
      className="logo-image"
      alt="Modded Logo"
    />
    {!isLoggedIn && <p className="minecraft-text">Only Aug 1st - 7th, 2025</p>}
    {userName && <p className="minecraft-text">Hello @{userName}!</p>}
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
const FullButtonMenu = ({ playButtonSound, openBook, onJoinGame, userName, onLogout }) => (
  <div className="buttons-group">
    {userName ? (
      <FullButton onClick={() => window.location.href = '/app'}>
        Continue to Game
      </FullButton>
    ) : (
      <FullButton onClick={onJoinGame}>
        Join the game
      </FullButton>
    )}

    <FullButton onClick={openBook}>
      What is this?
    </FullButton>

    <div className="button-row">
      <HalfButton onClick={() => {
        playButtonSound();
        window.open('https://github.com/hackclub/mob-games/releases', '_blank');
      }}>
        Mobs Made
      </HalfButton>
      <HalfButton onClick={onLogout}>
        {userName ? 'Logout' : 'Quit Game'}
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
          style={{
            userSelect: 'none',
            draggable: false,
            WebkitUserSelect: 'none',
            WebkitUserDrag: 'none'
          }}
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
  const [userName, setUserName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if we're on localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          // Use environment variables for localhost
          const hardcodedUserData = {
            slackId: process.env.NEXT_PUBLIC_LOCALHOST_USER_SLACK_ID,
            accessToken: process.env.NEXT_PUBLIC_LOCALHOST_USER_ACCESS_TOKEN
          };
          
          // Only proceed if we have the required environment variables
          if (hardcodedUserData.slackId && hardcodedUserData.accessToken) {
            // Set a cookie with the hardcoded data
            document.cookie = `userData=${JSON.stringify(hardcodedUserData)}; Path=/; SameSite=Strict; Max-Age=3600`;
            
            // Set the user name (you can customize this)
            setUserName("Thomas");
          }
        } else {
          // Production: fetch from API
          const response = await fetch('/api/user/accessUserData');
          if (response.ok) {
            const userData = await response.json();
            // Use Minecraft username if available, otherwise use Slack name
            let displayName = null;
            if (userData.airtable && userData.airtable.minecraftUsername) {
              displayName = userData.airtable.minecraftUsername;
            } else if (userData.slack.name) {
              displayName = userData.slack.name.split(' ')[0];
            }
            setUserName(displayName);
          }
        }
      } catch (error) {
        console.log('User not logged in or error fetching user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  
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

  const handleJoinGame = () => {
    playButtonSound();
    router.push('/login');
  };

  const handleLogout = () => {
    playButtonSound();
    
    if (userName) {
      // User is logged in - handle logout
      // Clear the userData cookie by setting it to expire in the past
      // Clear for all possible paths and domains
      document.cookie = 'userData=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      document.cookie = 'userData=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userData=; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Also clear any potential HttpOnly cookies by calling a logout API
      fetch('/api/logout', { method: 'POST' }).catch(() => {
        // Ignore errors, just try to clear server-side cookies
      });
      
      // Clear the local state immediately
      setUserName(null);
      
      // Small delay to ensure cookie clearing, then refresh
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      // User is not logged in - show the original "Hackers never quit" message
      alert('Hackers never quit');
    }
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

  if (isLoading) {
    return <div></div>;
  }

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
          <TitleText userName={userName} isLoggedIn={!!userName} />
          <FullButtonMenu playButtonSound={playButtonSound} openBook={openBook} onJoinGame={handleJoinGame} userName={userName} onLogout={handleLogout} />
        </ContentContainer>
        
        <Footer />
      </div>
    </>
  );
}
