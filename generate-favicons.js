import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createRoundFavicon(inputPath, outputPath, size) {
    try {
        // Create a circular mask
        const mask = Buffer.from(
            `<svg width="${size}" height="${size}">
                <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
            </svg>`
        );

        await sharp(inputPath)
            .resize(size, size, { 
                fit: 'cover',
                position: 'center'
            })
            .composite([{
                input: mask,
                blend: 'dest-in'
            }])
            .png()
            .toFile(outputPath);
            
        console.log(`✓ Created ${outputPath} (${size}x${size})`);
    } catch (error) {
        console.error(`Error creating ${outputPath}:`, error.message);
    }
}

async function generateAllFavicons() {
    const logoPath = path.join(__dirname, 'public', 'images', 'logo.png');
    const publicPath = path.join(__dirname, 'public');
    
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
        console.error('Logo file not found at:', logoPath);
        console.log('Please make sure you have a logo.png file in public/images/');
        return;
    }
    
    console.log('Generating round favicons from:', logoPath);
    console.log('Output directory:', publicPath);
    
    // Generate different sizes
    const sizes = [
        { size: 16, filename: 'favicon-16.png' },
        { size: 32, filename: 'favicon-32.png' },
        { size: 48, filename: 'favicon-48.png' },
        { size: 180, filename: 'apple-touch-icon.png' },
        { size: 192, filename: 'android-chrome-192x192.png' },
        { size: 512, filename: 'android-chrome-512x512.png' }
    ];
    
    for (const { size, filename } of sizes) {
        const outputPath = path.join(publicPath, filename);
        await createRoundFavicon(logoPath, outputPath, size);
    }
    
    // Generate ICO file (simplified version - just copy the 32px)
    try {
        const ico32Path = path.join(publicPath, 'favicon-32.png');
        const icoPath = path.join(publicPath, 'favicon.ico');
        
        // For a proper ICO, we'll just copy the PNG for now
        // In production, you'd want to use a proper ICO converter
        await sharp(ico32Path)
            .resize(32, 32)
            .png()
            .toFile(icoPath);
            
        console.log('✓ Created favicon.ico');
    } catch (error) {
        console.error('Error creating ICO:', error.message);
    }
    
    console.log('\n🎉 All favicons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Check the generated files in the public folder');
    console.log('2. Clear your browser cache to see the new favicon');
    console.log('3. The new favicons should appear round in browser tabs');
}

// Run the script
generateAllFavicons().catch(console.error);
