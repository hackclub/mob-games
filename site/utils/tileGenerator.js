// Array of available tile textures
const tileTextures = [
  '/tiles/dirtblocktile.jpg',
  '/tiles/cobblestone.jpg',
  '/tiles/stone.jpg',
  '/tiles/iron_ore.jpg',
  '/tiles/diamond_ore.jpg',
  '/tiles/coal_ore.jpg',
  '/tiles/gold_ore.jpg',
  '/tiles/grass.jpg',
  '/tiles/sand.jpg',
  '/tiles/gravel.jpg',
  '/tiles/bedrock.jpg'
];

// Generate a random tile pattern
export function generateRandomTilePattern() {
  const pattern = [];
  const rows = Math.ceil(window.innerHeight / 64) + 2; // Add extra rows for scrolling
  const cols = Math.ceil(window.innerWidth / 64) + 2;  // Add extra cols for scrolling
  
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      // Randomly select a tile texture
      const randomIndex = Math.floor(Math.random() * tileTextures.length);
      row.push(tileTextures[randomIndex]);
    }
    pattern.push(row);
  }
  
  return pattern;
}

// Create CSS for the tile pattern
export function createTilePatternCSS(pattern) {
  let css = '';
  
  pattern.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      const x = colIndex * 64;
      const y = rowIndex * 64;
      
      css += `
        .tile-${rowIndex}-${colIndex} {
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 64px;
          height: 64px;
          background-image: url('${tile}');
          background-size: 64px 64px;
          background-repeat: no-repeat;
        }
      `;
    });
  });
  
  return css;
}

// Generate a mixed tile background with multiple textures
export function generateMixedTileBackground() {
  // Create a pattern with multiple textures
  const mixedPattern = [];
  const rows = 20; // Fixed number of rows
  const cols = 30; // Fixed number of columns
  
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      // Use different textures based on position for more realistic patterns
      let textureIndex;
      
      // Create some patterns (grass on top, stone in middle, ores scattered)
      if (i < 3) {
        // Top layer - mostly grass and dirt
        textureIndex = Math.random() < 0.7 ? 2 : 1; // 70% grass, 30% dirt
      } else if (i < 8) {
        // Middle layer - stone, cobblestone, some ores
        const rand = Math.random();
        if (rand < 0.4) textureIndex = 2; // stone
        else if (rand < 0.7) textureIndex = 1; // cobblestone
        else if (rand < 0.8) textureIndex = 3; // iron ore
        else if (rand < 0.9) textureIndex = 5; // coal ore
        else textureIndex = 6; // gold ore
      } else {
        // Deep layer - more ores, bedrock at bottom
        const rand = Math.random();
        if (i === rows - 1) textureIndex = 10; // bedrock at bottom
        else if (rand < 0.3) textureIndex = 2; // stone
        else if (rand < 0.35) textureIndex = 4; // diamond ore
        else if (rand < 0.4) textureIndex = 3; // iron ore
        else if (rand < 0.85) textureIndex = 2; // coal ore
        else textureIndex = 2; // gold ore
      }
      
      row.push(tileTextures[textureIndex]);
    }
    mixedPattern.push(row);
  }
  
  return mixedPattern;
}

// Alternative: Generate a simpler random background with CSS
export function generateRandomBackground() {
  const randomTiles = [];
  const numTiles = 50; // Number of random tiles to generate
  
  for (let i = 0; i < numTiles; i++) {
    const randomIndex = Math.floor(Math.random() * tileTextures.length);
    randomTiles.push(tileTextures[randomIndex]);
  }
  
  return randomTiles;
} 