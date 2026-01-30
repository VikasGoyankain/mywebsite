/**
 * OG Image Generator Script
 * 
 * This script converts SVG OG images to PNG format for better social media compatibility.
 * 
 * Prerequisites:
 * - Node.js installed
 * - Install sharp: pnpm add -D sharp
 * 
 * Usage:
 * - Run: node scripts/generate-og-images.js
 * 
 * Alternatively, you can use online tools like:
 * - https://svgtopng.com/
 * - https://cloudconvert.com/svg-to-png
 * 
 * Recommended OG image dimensions:
 * - Width: 1200px
 * - Height: 630px
 * - Format: PNG or JPG
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp is not installed. Install it with: pnpm add -D sharp');
  console.log('\nAlternatively, you can manually convert the SVG files to PNG using online tools:');
  console.log('- https://svgtopng.com/');
  console.log('- https://cloudconvert.com/svg-to-png');
  console.log('\nSVG files to convert:');
  console.log('- public/og-image.svg -> public/og-image.png (or .jpg)');
  console.log('- public/og-blog.svg -> public/og-blog.png');
  console.log('- public/og-casevault.svg -> public/og-casevault.png');
  console.log('- public/og-research.svg -> public/og-research.png');
  console.log('- public/icon.svg -> public/favicon.ico (32x32)');
  console.log('- public/apple-touch-icon.svg -> public/apple-touch-icon.png (180x180)');
  process.exit(0);
}

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// OG Images to convert (1200x630)
const ogImages = [
  { input: 'og-image.svg', output: 'og-image.png', width: 1200, height: 630 },
  { input: 'og-image.svg', output: 'og-image.jpg', width: 1200, height: 630, format: 'jpeg' },
  { input: 'og-blog.svg', output: 'og-blog.png', width: 1200, height: 630 },
  { input: 'og-casevault.svg', output: 'og-casevault.png', width: 1200, height: 630 },
  { input: 'og-research.svg', output: 'og-research.png', width: 1200, height: 630 },
];

// App icons to convert
const appIcons = [
  { input: 'icon.svg', output: 'favicon-32x32.png', width: 32, height: 32 },
  { input: 'icon.svg', output: 'favicon-16x16.png', width: 16, height: 16 },
  { input: 'apple-touch-icon.svg', output: 'apple-touch-icon.png', width: 180, height: 180 },
];

// PWA icons to convert
const pwaIcons = [
  { input: '../icon.svg', output: 'icon-72x72.png', width: 72, height: 72 },
  { input: '../icon.svg', output: 'icon-96x96.png', width: 96, height: 96 },
  { input: '../icon.svg', output: 'icon-128x128.png', width: 128, height: 128 },
  { input: '../icon.svg', output: 'icon-144x144.png', width: 144, height: 144 },
  { input: '../icon.svg', output: 'icon-152x152.png', width: 152, height: 152 },
  { input: '../icon.svg', output: 'icon-192x192.png', width: 192, height: 192 },
  { input: '../icon.svg', output: 'icon-384x384.png', width: 384, height: 384 },
  { input: '../icon.svg', output: 'icon-512x512.png', width: 512, height: 512 },
];

async function convertImage(inputPath, outputPath, width, height, format = 'png') {
  try {
    const inputBuffer = fs.readFileSync(inputPath);
    
    let pipeline = sharp(inputBuffer)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      });
    
    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: 90 });
    } else {
      pipeline = pipeline.png();
    }
    
    await pipeline.toFile(outputPath);
    console.log(`✓ Created: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to convert ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log('Converting OG images...\n');
  
  // Convert OG images
  for (const img of ogImages) {
    const inputPath = path.join(publicDir, img.input);
    const outputPath = path.join(publicDir, img.output);
    await convertImage(inputPath, outputPath, img.width, img.height, img.format);
  }
  
  console.log('\nConverting app icons...\n');
  
  // Convert app icons
  for (const icon of appIcons) {
    const inputPath = path.join(publicDir, icon.input);
    const outputPath = path.join(publicDir, icon.output);
    await convertImage(inputPath, outputPath, icon.width, icon.height);
  }
  
  console.log('\nConverting PWA icons...\n');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Convert PWA icons
  for (const icon of pwaIcons) {
    const inputPath = path.join(iconsDir, icon.input);
    const outputPath = path.join(iconsDir, icon.output);
    await convertImage(inputPath, outputPath, icon.width, icon.height);
  }
  
  console.log('\n✓ All images converted successfully!');
  console.log('\nNote: Update your metadata files to use .png or .jpg extensions for OG images');
}

main().catch(console.error);
