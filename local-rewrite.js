const fs = require('fs');
const path = require('path');

const TARGET_FOLDER = 'sitepics';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Inject a highly selective CSS engine to isolate the true background blur
    const precisionFix = `
<style>
  /* 1. RESET ALL IMAGES TO BE CRISP AND PROPORTIONAL BY DEFAULT */
  img, 
  picture, 
  .x-el-img, 
  [data-ux="Image"],
  [data-ux="ImageContainer"],
  div[data-ux="Background"] {
    filter: none !important;
    backdrop-filter: none !important;
    opacity: 1 !important;
    object-fit: cover !important;
  }

  /* 2. TARGET ONLY THE GENUINE HERO BACKGROUND LAYER THAT LIVES UNDERNEATH A SHARP IMAGE */
  /* This looks for containers that have a sibling container or are designated background layers */
  [data-ux="ImageContainer"] + [data-ux="ImageContainer"] img,
  div[role="img"]:first-child:not(:only-child),
  .dim + div div[data-ux="Background"] {
    filter: blur(20px) brightness(0.8) !important;
    transform: scale(1.05) !important;
    opacity: 0.85 !important;
  }

  /* 3. HARD LOCK FOREGROUND FACE IMAGES TO ALWAYS REMAIN CRISP */
  img:only-of-type,
  img[data-aid="HERO_IMAGE_RENDERED"],
  [data-ux="ImageContainer"]:last-child img,
  .widget-gallery-gallery-2 img {
    filter: none !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 5 !important;
  }
</style>
`;

    // Strip out the previous messy style block if it exists, then add the clean one
    content = content.replace(/<style>[\s\S]*?<\/style>/i, '');
    
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${precisionFix}</head>`);
    } else {
        content = precisionFix + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Isolated hero blur successfully in: ${filePath}`);
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git' && file !== TARGET_FOLDER) {
            scanDirectory(fullPath);
        } else if (stat.isFile() && path.extname(file).toLowerCase() === '.html') {
            processFile(fullPath);
        }
    }
}

console.log("Isolating background layers and sharpening standard images...");
scanDirectory('./');
console.log("\nTargeted correction complete! Force push to deploy live.");
