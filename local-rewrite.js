const fs = require('fs');
const path = require('path');

const TARGET_FOLDER = 'sitepics';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove GoDaddy's broken tracking scripts causing MIME errors
    content = content.replace(/<script[^>]*src=["'](?:js\/)?script\.js["'][^>]*><\/script>/gi, '');
    content = content.replace(/<script[^>]*src=["'](?:index_files\/)?[^"'\s>]+\.js["'][^>]*><\/script>/gi, '');
    content = content.replace(/srcset=["'][^"']*["']/gi, '');

    // 2. Inject CSS layout fixes to fix image stretching and restore the blur background effect
    const styleFix = `
<style>
  /* Fixes image stretching globally across single-line layouts */
  img[data-ux="Image"],
  img, 
  .x-el-img {
    object-fit: cover !important;
    max-width: 100% !important;
  }
  
  /* TARGETS THE HERO SECTION: Restores the background blur look safely via pure CSS */
  picture:first-of-type,
  [data-ux="ImageContainer"]:first-of-type,
  .widget-gallery-gallery-2 div[role="img"]:first-child,
  div[data-ux="Background"] {
    filter: blur(20px) brightness(0.8) !important; /* Emulates the original blurred backing look */
    transform: scale(1.05) !important; /* Prevents white artifacts on edge boundaries */
    opacity: 0.85 !important;
  }

  /* Ensures the foreground sharp image layer breaks out of the blur styling rule */
  img:only-of-type,
  img[data-aid="HERO_IMAGE_RENDERED"], 
  [data-ux="Image"] {
    filter: none !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 5 !important;
  }
</style>
`;

    if (content.includes('</head>')) {
        content = content.replace('</head>', `${styleFix}</head>`);
    } else {
        content = styleFix + content;
    }

    fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Re-applied look configuration on: ${filePath}`);
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

console.log("Restoring graphic blur layers and locking layouts...");
scanDirectory('./');
console.log("\nLayout adjustments complete! Push to GitHub to verify production.");
