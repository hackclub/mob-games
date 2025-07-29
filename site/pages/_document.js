import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Five days where folks build their own minecraft mods that add a creature to the game and then every contributor is invited to a weekend event where they fight to the death in a team-based pvp survival world full of the creatures that they made." />
        <meta name="keywords" content="minecraft, mods, mobs, pvp, survival, hackathon, game development" />
        
        {/* Mobile Safari Fullscreen and Status Bar */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mob Games" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/MobGamesLogo.png" />
        <link rel="apple-touch-icon" href="/MobGamesLogo.png" />
        
        {/* Open Graph and Twitter meta images */}
        <meta property="og:title" content="Mob Games (short experiment)" />
        <meta property="og:description" content="Five days where folks build their own minecraft mods that add a creature to the game and then every contributor is invited to a weekend event where they fight to the death in a team-based pvp survival world full of the creatures that they made." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Mob Games (short experiment)" />
        <meta name="twitter:description" content="Five days where folks build their own minecraft mods that add a creature to the game and then every contributor is invited to a weekend event where they fight to the death in a team-based pvp survival world full of the creatures that they made." />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/fonts/Minecraft.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/minecraftBG.webm" as="video" />
        <link rel="preload" href="/minecraftBG.mp4" as="video" />
        <link rel="preload" href="/ModdedLogo.png" as="image" />
        <link rel="preload" href="/minecraft-button.mp3" as="audio" />
        <link rel="preload" href="/bookBG.png" as="image" />
        
        <style>{`
          @font-face {
            font-family: 'Minecraft';
            src: url('/fonts/Minecraft.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          
          /* Server-rendered static styles */
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
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
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
          
          .bottom-text.mobile {
            justify-content: center;
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
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
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
          
          .buttons-group {
            display: flex;
            flex-direction: column;
            gap: 22px;
            align-items: center;
            margin-top: 45px;
          }
          
          .main-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
          
          .background-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -1;
            pointer-events: none;
            user-select: none;
            margin-top: calc(-1 * env(safe-area-inset-top));
            margin-left: calc(-1 * env(safe-area-inset-left));
            margin-right: calc(-1 * env(safe-area-inset-right));
            margin-bottom: calc(-1 * env(safe-area-inset-bottom));
          }
          
          .content-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
            text-align: center;
          }
          
          .logo-image {
            width: 1120px;
            max-width: 90vw;
            display: block;
            pointer-events: none;
            user-select: none;
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
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
