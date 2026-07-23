const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      if (file !== '.git' && file !== 'node_modules') walk(p);
    } else if (path.extname(p) === '.html') {
      let c = fs.readFileSync(p, 'utf8');
      let o = c;
      
      const isRoot = p.endsWith('lolaaro_dot_com\\index.html') || p.endsWith('lolaaro_dot_com/index.html');
      const assetPrefix = isRoot ? './index_files/' : '../index_files/';
      
      // Fix folder references back to index_files without breaking image logic
      c = c.replace(/(Home_files|Media_Photos_files|Media_Service_files|Publications_White\s?Papers_files|Publications_Reports_files|Publications_Contributions_files|Publications_Lectures_files|Experience_Professional\s?Experience_Career_files|Contact_files|index_assets)[/\\\\]?/gi, function(match) {
        return match.toLowerCase().includes('index_files') ? match : assetPrefix;
      });
      
      // Clean extensions inside the text
      c = c.replace(/\.js\.download/g, '.js').replace(/\.css\.download/g, '.css');
      c = c.replace(/src=\"\//g, 'src=\"./').replace(/href=\"\//g, 'href=\"./');
      
      // Only execute this mapping if we are inside a subfolder page
      if (isRoot === false) {
        c = c.replace(/([\"'])\/\/(hbs[0-9]+|hb75)\.JPG/gi, '$1../media-photos/$2.JPG');
        c = c.replace(/([\"'])\/\/(hbs[0-9]+|hb75)\.jpg/gi, '$1../media-photos/$2.jpg');
      }
      
      c = c.replace(/([^:]\/)\/+/g, '$1');
      
      if (c !== o) {
        fs.writeFileSync(p, c, 'utf8');
        console.log('✅ Safely Re-aligned: ' + p);
      }
    }
  });
}

console.log('🚀 Running safe realignment without touching GoDaddy parameters...');
walk(__dirname);
console.log('🏁 Realignment finished!');
