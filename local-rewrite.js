const fs = require('fs');
const path = require('path');

const TARGET_FOLDER = 'sitepics';
const IMG_DIR = path.join('./', TARGET_FOLDER);

// 1. Rename files inside the sitepics folder to be completely lowercase and hyphenated
if (fs.existsSync(IMG_DIR)) {
    const files = fs.readdirSync(IMG_DIR);
    files.forEach(file => {
        const oldPath = path.join(IMG_DIR, file);
        
        // Converts spaces to hyphens and forces lowercase (e.g., "Photo 1.JPG" -> "photo-1.jpg")
        const newName = file.replace(/ /g, '-').toLowerCase(); 
        const newPath = path.join(IMG_DIR, newName);
        
        if (file !== newName) {
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed asset: "${file}" -> "${newName}"`);
        }
    });
}

// 2. Update all HTML file links to match the lowercase target format
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Look for any sitepics asset directory references
    const sitepicsRegex = /\/sitepics\/([^"'\s>]+)/g;
    
    content = content.replace(sitepicsRegex, (match, p1) => {
        // Force url-encoded spaces and extensions to be completely lowercase and hyphenated
        const cleanedName = p1.replace(/%20/g, '-').replace(/ /g, '-').toLowerCase();
        return `/sitepics/${cleanedName}`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Lowercased image paths in: ${filePath}`);
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

console.log("Standardizing all assets to lowercase for Cloudflare Linux compliance...");
scanDirectory('./');
console.log("\nAll assets and code strings normalized! Ready to deploy to GitHub.");
