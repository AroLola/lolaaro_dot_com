const fs = require('fs');
const path = require('path');

const TARGET_FOLDER = 'sitepics';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const precisionFix = `
<style>
  /* 1. RESET RECOVERY: GUARANTEE EVERY IMAGE ON THE SITE IS CRISP BY DEFAULT */
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

  /* 2. ISOLATED TARGET: ONLY BLUR THE UNDERLAY IMAGE INSIDE THE SPECIFIC HERO ID CONTAINER */
  #e2874a70-b322-4691-aede-1a4eeb19c879 div[role="img"]:first-child,
  #e2874a70-b322-4691-aede-1a4eeb19c879 [data-ux="ImageContainer"]:first-child img {
    filter: blur(25px) brightness(0.75) !important;
    transform: scale(1.06) !important;
    opacity: 0.9 !important;
  }

  /* 3. HARD RE-SHARPEN THE FOREGROUND FACE IMAGE IN THAT SAME CONTAINER */
  #e2874a70-b322-4691-aede-1a4eeb19c879 div[role="img"]:last-child,
  #e2874a70-b322-4691-aede-1a4eeb19c879 [data-ux="ImageContainer"]:last-child img {
    filter: none !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 10 !important;
  }
</style>
`;

    // Strip previous style blocks to avoid rule stacking confusion
    content = content.replace(/<style>[\s\S]*?<\/style>/i, '');
    
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${precisionFix}</head>`);
    } else {
        content = precisionFix + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Locked unique ID targeting filters on: ${filePath}`);
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

console.log("Applying hyper-targeted ID constraints to clear global image blur...");
scanDirectory('./');
console.log("\nID filtering applied successfully! Push to GitHub to deploy.");
