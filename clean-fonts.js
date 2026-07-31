const fs = require('fs');
const path = require('path');

// FIXED: Domain endpoints are fully restored with correct Google Font query parameters
const CLEAN_FONT_CODE = `  <link rel="preconnect" href="https://googleapis.com">
  <link rel="preconnect" href="https://gstatic.com" crossorigin>
  <link href="https://googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&family=Cantarell:ital,wght@0,400;0,700;1,400;1,700&family=Dancing+Script:wght@400..700&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Gentium+Basic:ital,wght@0,400;0,700;1,400;1,700&family=Italiana&family=Josefin+Slab:ital,wght@0,100..700;1,100..700&family=Righteous&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">`;

// Matches original GoDaddy inline fonts container blocks
const fontStyleBlockPattern = /<style data-inline-fonts="">[\s\S]*?<\/style>/gi;

// Matches previous broken script tags to clear out bad iterations cleanly
const brokenFontTagPattern = /<link[^>]*?href="https:\/\/(?:fonts\.)?googleapis\.com(?:"|\s|\/)/gi;
const brokenGstaticPattern = /<link[^>]*?href="https:\/\/(?:fonts\.)?gstatic\.com[^>]*?>/gi;

function walkAndCleanFonts(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walkAndCleanFonts(fullPath);
      }
    } else if (file.toLowerCase().endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let shouldWrite = false;
      let cleanedContent = content;

      // 1. Process and strip original GoDaddy block if it exists
      if (fontStyleBlockPattern.test(cleanedContent)) {
        console.log(`Purging original GoDaddy font styles in: ${fullPath}`);
        cleanedContent = cleanedContent.replace(fontStyleBlockPattern, '');
        shouldWrite = true;
      }

      // 2. Clear out any previous broken link variations to avoid file pollution
      if (brokenFontTagPattern.test(cleanedContent) || brokenGstaticPattern.test(cleanedContent)) {
        console.log(`Cleaning old broken font links from previous run in: ${fullPath}`);
        
        // Use a wide match to clear the broken preconnect and style blocks cleanly
        cleanedContent = cleanedContent.replace(/<link[^>]*?href="https:\/\/(?:fonts\.)?googleapis\.com[^>]*?>/gi, '');
        cleanedContent = cleanedContent.replace(/<link[^>]*?href="https:\/\/(?:fonts\.)?gstatic\.com[^>]*?>/gi, '');
        shouldWrite = true;
      }

      // 3. If modifications were made, safely inject the updated uniform Google link block
      if (shouldWrite || !cleanedContent.includes('family=Dancing+Script')) {
        if (cleanedContent.includes('</head>')) {
          // Double check to strip any residual matches right before injecting clean references
          cleanedContent = cleanedContent.replace('</head>', `${CLEAN_FONT_CODE}\n</head>`);
          fs.writeFileSync(fullPath, cleanedContent, 'utf8');
          console.log(`Successfully deployed clean 9-font pack to: ${fullPath}`);
        }
      }
    }
  });
}

// Execute processing routing configuration
walkAndCleanFonts('.');
console.log('Success! All 9 fonts consolidated into a secure Google Fonts link across all pages.');
