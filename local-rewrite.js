const fs = require('fs');
const path = require('path');

const TARGET_FOLDER = 'sitepics';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const precisionFix = `
<style>
  /* 1. FORCE ABSOLUTELY EVERYTHING ON THE HOME PAGE TO BE PURE CRISP */
  img, 
  picture, 
  .x-el-img, 
  [data-ux="Image"],
  [data-ux="ImageContainer"],
  div[data-ux="Background"],
  div[role="img"] {
    filter: none !important;
    backdrop-filter: none !important;
    opacity: 1 !important;
    object-fit: cover !important;
  }

  /* 2. REVERSE LAYER FIX: TARGET THE FIRST IMAGE CONTAINER IN THE STACK WHICH ACTS AS THE UNDERLAY BACKGROUND */
  [data-ux="ImageContainer"]:first-child img,
  div[role="img"]:first-child,
  div[data-aid="HERO_IMAGE_RENDERED"]:first-of-type {
    filter: blur(25px) brightness(0.75) !important; /* Locks blur onto the background photo only */
    transform: scale(1.06) !important; /* Expands edges slightly to hide edge bleeding */
    opacity: 0.9 !important;
  }

  /* 3. ABSOLUTE SAFEGUARD FOR FOREGROUND FACES AND GALLERIES */
  /* This says if an image is the last child or a lone image, keep it 100% sharp */
  [data-ux="ImageContainer"]:last-child img,
  [data-ux="ImageContainer"]:only-child img,
  img:only-of-type,
  .widget-gallery-grid img,
  .plain-gallery-grid img {
    filter: none !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 10 !important;
  }
</style>
`;

    // Clean out previous style overrides to prevent layout conflicts
    content = content.replace(/<style>[\s\S]*?<\/style>/i, '');
    
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${precisionFix}</head>`);
    } else {
        content = precisionFix + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Reversed and corrected image blur targets in: ${filePath}`);
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

console.log("Re-aligning stacked layer targets and unblurring profiles...");
scanDirectory('./');
console.log("\nLayer flip adjustments applied successfully! Push to GitHub to deploy.");
