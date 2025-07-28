import { useEffect } from 'react';
import '../styles/globals.css';

const mobHeads = [
  'https://mc-heads.net/head/creeper',
  'https://mc-heads.net/head/zombie',
  'https://mc-heads.net/head/skeleton',
  'https://mc-heads.net/head/wither_skeleton',
  'https://mc-heads.net/head/Steve',
  'https://mc-heads.net/head/Alex',
  'https://mc-heads.net/head/enderman',
  'https://mc-heads.net/head/spider',
  'https://mc-heads.net/head/cave_spider',
  'https://mc-heads.net/head/slime',
  'https://mc-heads.net/head/magma_cube',
  'https://mc-heads.net/head/ghast',
  'https://mc-heads.net/head/blaze',
  'https://mc-heads.net/head/silverfish',
  'https://mc-heads.net/head/endermite',
  'https://mc-heads.net/head/guardian',
  'https://mc-heads.net/head/elder_guardian',
  'https://mc-heads.net/head/shulker',
  'https://mc-heads.net/head/vex',
  'https://mc-heads.net/head/vindicator',
  'https://mc-heads.net/head/evoker',
  'https://mc-heads.net/head/pillager',
  'https://mc-heads.net/head/ravager',
  'https://mc-heads.net/head/witch',
  'https://mc-heads.net/head/villager',
  'https://mc-heads.net/head/wandering_trader',
  'https://mc-heads.net/head/piglin',
  'https://mc-heads.net/head/piglin_brute',
  'https://mc-heads.net/head/zombified_piglin',
  'https://mc-heads.net/head/hoglin',
  'https://mc-heads.net/head/zoglin',
  'https://mc-heads.net/head/strider',
  'https://mc-heads.net/head/warden',
  'https://mc-heads.net/head/allay',
  'https://mc-heads.net/head/frog',
  'https://mc-heads.net/head/tadpole',
  'https://mc-heads.net/head/axolotl',
  'https://mc-heads.net/head/goat',
  'https://mc-heads.net/head/bee',
  'https://mc-heads.net/head/dolphin',
  'https://mc-heads.net/head/turtle',
  'https://mc-heads.net/head/panda',
  'https://mc-heads.net/head/fox',
  'https://mc-heads.net/head/ocelot',
  'https://mc-heads.net/head/cat',
  'https://mc-heads.net/head/wolf',
  'https://mc-heads.net/head/horse',
  'https://mc-heads.net/head/donkey',
  'https://mc-heads.net/head/mule',
  'https://mc-heads.net/head/llama',
  'https://mc-heads.net/head/trader_llama',
  'https://mc-heads.net/head/cow',
  'https://mc-heads.net/head/mooshroom',
  'https://mc-heads.net/head/pig',
  'https://mc-heads.net/head/sheep',
  'https://mc-heads.net/head/chicken',
  'https://mc-heads.net/head/rabbit',
  'https://mc-heads.net/head/bat',
  'https://mc-heads.net/head/squid',
  'https://mc-heads.net/head/glow_squid',
  'https://mc-heads.net/head/cod',
  'https://mc-heads.net/head/salmon',
  'https://mc-heads.net/head/tropical_fish',
  'https://mc-heads.net/head/pufferfish',
  'https://mc-heads.net/head/phantom',
  'https://mc-heads.net/head/drowned',
  'https://mc-heads.net/head/husk',
  'https://mc-heads.net/head/stray',
  'https://mc-heads.net/head/giant',
  'https://mc-heads.net/head/iron_golem',
  'https://mc-heads.net/head/snow_golem',
  'https://mc-heads.net/head/ender_dragon',
  'https://mc-heads.net/head/wither',
];

function setFavicon(src) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = src;
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Set initial favicon
    setFavicon(mobHeads[Math.floor(Math.random() * mobHeads.length)]);
    // Change favicon every 3 seconds
    const interval = setInterval(() => {
      setFavicon(mobHeads[Math.floor(Math.random() * mobHeads.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return <Component {...pageProps} />;
}
