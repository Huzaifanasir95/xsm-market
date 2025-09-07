const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function optimizeExistingLogo() {
    try {
        console.log('🚀 Optimizing XSM Market logo for favicon...\n');

        // Load the existing logo
        const logoPath = path.join(__dirname, 'public', 'images', 'logo.png');
        console.log('📂 Loading logo from:', logoPath);
        
        if (!fs.existsSync(logoPath)) {
            throw new Error('Logo file not found at: ' + logoPath);
        }

        const logoImage = await loadImage(logoPath);
        console.log(`✅ Logo loaded: ${logoImage.width}x${logoImage.height}px`);

        // Create base canvas for favicon (square format)
        const baseSize = 512;
        const canvas = createCanvas(baseSize, baseSize);
        const ctx = canvas.getContext('2d');

        // Clear canvas with transparent background
        ctx.clearRect(0, 0, baseSize, baseSize);

        // Calculate scaling to fit logo properly in square canvas
        const logoAspectRatio = logoImage.width / logoImage.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (logoAspectRatio > 1) {
            // Logo is wider than tall
            drawWidth = baseSize * 0.9; // Leave some padding
            drawHeight = drawWidth / logoAspectRatio;
        } else {
            // Logo is taller than wide or square
            drawHeight = baseSize * 0.9; // Leave some padding
            drawWidth = drawHeight * logoAspectRatio;
        }

        // Center the logo
        drawX = (baseSize - drawWidth) / 2;
        drawY = (baseSize - drawHeight) / 2;

        // Set high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the logo
        ctx.drawImage(logoImage, drawX, drawY, drawWidth, drawHeight);

        // Generate all required favicon sizes
        const sizes = [
            { size: 16, name: 'favicon-16.png' },
            { size: 32, name: 'favicon-32.png' },
            { size: 48, name: 'favicon-48.png' },
            { size: 180, name: 'apple-touch-icon.png' },
            { size: 192, name: 'android-chrome-192x192.png' },
            { size: 512, name: 'android-chrome-512x512.png' }
        ];

        console.log('📁 Generating optimized favicon files...');
        
        for (const { size, name } of sizes) {
            const smallCanvas = createCanvas(size, size);
            const smallCtx = smallCanvas.getContext('2d');
            
            // Use high quality resampling for better small icon clarity
            smallCtx.imageSmoothingEnabled = true;
            smallCtx.imageSmoothingQuality = 'high';
            
            // For very small sizes (16px, 32px), add slight background for better visibility
            if (size <= 32) {
                // Add subtle white background with slight transparency
                smallCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                smallCtx.fillRect(0, 0, size, size);
            }
            
            // Draw the scaled logo
            smallCtx.drawImage(canvas, 0, 0, size, size);
            
            // Save the file
            const buffer = smallCanvas.toBuffer('image/png');
            const filePath = path.join(__dirname, 'public', name);
            fs.writeFileSync(filePath, buffer);
            
            console.log(`✅ Created ${name} (${size}x${size})`);
        }

        // Create ICO file (using 32x32 version for compatibility)
        const ico32Canvas = createCanvas(32, 32);
        const ico32Ctx = ico32Canvas.getContext('2d');
        ico32Ctx.imageSmoothingEnabled = true;
        ico32Ctx.imageSmoothingQuality = 'high';
        
        // Add slight background for ICO file
        ico32Ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ico32Ctx.fillRect(0, 0, 32, 32);
        ico32Ctx.drawImage(canvas, 0, 0, 32, 32);
        
        const icoBuffer = ico32Canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), icoBuffer);
        console.log('✅ Created favicon.ico (32x32)');

        // Update web manifest with XSM Market branding
        const manifest = {
            "name": "XSM Market",
            "short_name": "XSM",
            "description": "Buy and Sell Digital Assets",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": "#ff3030",
            "icons": [
                {
                    "src": "/android-chrome-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "/android-chrome-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ]
        };

        fs.writeFileSync(
            path.join(__dirname, 'public', 'site.webmanifest'), 
            JSON.stringify(manifest, null, 2)
        );
        console.log('✅ Updated site.webmanifest');

        console.log('\n🎉 Logo optimization complete!');
        console.log('📋 What was done:');
        console.log('   • Used your existing XSM Market logo');
        console.log('   • Optimized scaling for square favicon format');
        console.log('   • Generated all required sizes (16px to 512px)');
        console.log('   • Added subtle background for small sizes visibility');
        console.log('   • High-quality resampling for crisp edges');
        console.log('   • Maintained logo proportions and clarity');
        console.log('\n🔧 The favicon will now display your actual logo in:');
        console.log('   • Browser tabs (perfectly sized and visible)');
        console.log('   • Bookmarks and browser UI');
        console.log('   • iOS and Android home screens');
        console.log('   • Progressive Web App icons');
        console.log('\n💡 Tip: Hard refresh your browser (Ctrl+F5) to see the new favicon!');

    } catch (error) {
        console.error('❌ Error optimizing logo:', error.message);
        
        if (error.message.includes('logo file not found')) {
            console.log('\n📁 Please ensure your logo is located at: public/images/logo.png');
        }
    }
}

// Run the logo optimization
optimizeExistingLogo();
