 const fs = require('fs');
const path = require('path');

// Updated to use your local path: /sitepics/blob-6ecdd09.png
const CLEAN_ICON_CODE = `<link rel="icon" href="/sitepics/blob-6ecdd09.png" sizes="32x32">
<link rel="apple-touch-icon" href="/sitepics/blob-6ecdd09.png">`;

// SAFE: Added '?' to make the tag processing lazy so it cannot eat your text links
const godaddyPattern = /<link rel="(?:apple-touch-icon|icon)"[^>]*?href="https:\/\/img1\.wsimg\.com\/[^"]*"[^>]*?>/gi;

function walkAndClean(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walkAndClean(fullPath);
      }
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Use a clean match check that doesn't advance regex state indices globally
      if (content.match(godaddyPattern)) {
        console.log(`Cleaning GoDaddy icons safely in: ${fullPath}`);

        // Strip out ONLY the old GoDaddy icons
        let cleanedContent = content.replace(godaddyPattern, '');

        // Safely place the clean local references right before the closing </head> tag
        if (cleanedContent.includes('</head>')) {
          cleanedContent = cleanedContent.replace('</head>', `${CLEAN_ICON_CODE}\n</head>`);
        }

        fs.writeFileSync(fullPath, cleanedContent, 'utf8');
      }
    }
  });
}

// Run the script starting from the current directory
walkAndClean('.');
console.log('Optimization complete! Local /sitepics/blob-6ecdd09.png icon path safely implemented.');
