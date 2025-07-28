import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Mob Games (short experiment)</title>
        <meta name="description" content="Five days where folks build their own minecraft mods that add a creature to the game and then every contributor is invited to a weekend event where they fight to the death in a team-based pvp survival world full of the creatures that they made." />
        <meta name="keywords" content="minecraft, mods, mobs, pvp, survival, hackathon, game development" />
        <meta property="og:title" content="Mob Games (short experiment)" />
        <meta property="og:description" content="Five days where folks build their own minecraft mods that add a creature to the game and then every contributor is invited to a weekend event where they fight to the death in a team-based pvp survival world full of the creatures that they made." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Mob Games (short experiment)" />
        <meta name="twitter:description" content="Five days where folks build their own minecraft mods that add a creature to the game and then every contributor is invited to a weekend event where they fight to the death in a team-based pvp survival world full of the creatures that they made." />
        <style>{`
          @font-face {
            font-family: 'Minecraft';
            src: url('/fonts/Minecraft.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
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
