const fs = require('fs');
const path = require('path');

// Unified code block containing all 9 fonts with standard weight variations
const CLEAN_FONT_CODE = `  <link rel="preconnect" href="https://googleapis.com">
  <link rel="preconnect" href="https://gstatic.com" crossorigin>
  <link href="https://googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&family=Cantarell:ital,wght@0,400;0,700;1,400;1,700&family=Dancing+Script:wght@400..700&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Gentium+Basic:ital,wght@0,400;0,700;1,400;1,700&family=Italiana&family=Josefin+Slab:ital,wght@0,100..700;1,100..700&family=Righteous&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">`;

// Matches the entire <style data-inline-fonts="">...</style> block containing the old code
const fontStyleBlockPattern = /<style data-inline-fonts="">[\s\S]*?<\/style>/gi;

function walkAndCleanFonts(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walkAndCleanFonts(fullPath);
      }
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      if (fontStyleBlockPattern.test(content)) {
        console.log(`Purging GoDaddy font blocks in: ${fullPath}`);

        // Strip the massive inline blocks completely
        let cleanedContent = content.replace(fontStyleBlockPattern, '');

        // Insert the single clean Google Fonts block right before the closing </head> tag
        if (cleanedContent.includes('</head>')) {
          cleanedContent = cleanedContent.replace('</head>', `${CLEAN_FONT_CODE}\n</head>`);
        }

        fs.writeFileSync(fullPath, cleanedContent, 'utf8');
      }
    }
  });
}

// Execute the process starting from the current directory
walkAndCleanFonts('.');
console.log('Success! All 9 fonts consolidated into a secure Google Fonts link across all pages.');
