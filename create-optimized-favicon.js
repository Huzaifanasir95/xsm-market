const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function createOptimizedFavicon() {
    try {
        console.log('🚀 Creating optimized favicon for XSM Market...\n');

        // Create a circular favicon design
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        // Clear canvas with transparent background
        ctx.clearRect(0, 0, 512, 512);

        // Create circular background
        const centerX = 256;
        const centerY = 256;
        const radius = 240;

        // Modern gradient background
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#FF6B35');  // Orange center
        gradient.addColorStop(0.7, '#FF3030'); // Red middle
        gradient.addColorStop(1, '#C41E3A');   // Dark red edge

        // Draw circular background
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add subtle shadow/border
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Draw "XSM" text - bold and centered
        ctx.fillStyle = 'white';
        ctx.font = 'bold 140px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        ctx.fillText('XSM', centerX, centerY - 10);

        // Add small "MARKET" text below
        ctx.font = 'bold 45px Arial, sans-serif';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText('MARKET', centerX, centerY + 80);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Generate all required favicon sizes
        const sizes = [
            { size: 16, name: 'favicon-16.png' },
            { size: 32, name: 'favicon-32.png' },
            { size: 48, name: 'favicon-48.png' },
            { size: 180, name: 'apple-touch-icon.png' },
            { size: 192, name: 'android-chrome-192x192.png' },
            { size: 512, name: 'android-chrome-512x512.png' }
        ];

        console.log('📁 Generating favicon files...');
        
        for (const { size, name } of sizes) {
            const smallCanvas = createCanvas(size, size);
            const smallCtx = smallCanvas.getContext('2d');
            
            // Use better resampling for small sizes
            smallCtx.imageSmoothingEnabled = true;
            smallCtx.imageSmoothingQuality = 'high';
            
            // Draw the scaled image
            smallCtx.drawImage(canvas, 0, 0, size, size);
            
            // Save the file
            const buffer = smallCanvas.toBuffer('image/png');
            const filePath = path.join(__dirname, 'public', name);
            fs.writeFileSync(filePath, buffer);
            
            console.log(`✅ Created ${name} (${size}x${size})`);
        }

        // Create ICO file (using 32x32 version)
        const ico32Canvas = createCanvas(32, 32);
        const ico32Ctx = ico32Canvas.getContext('2d');
        ico32Ctx.imageSmoothingEnabled = true;
        ico32Ctx.imageSmoothingQuality = 'high';
        ico32Ctx.drawImage(canvas, 0, 0, 32, 32);
        
        const icoBuffer = ico32Canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), icoBuffer);
        console.log('✅ Created favicon.ico (32x32)');

        // Create web manifest
        const manifest = {
            "name": "XSM Market",
            "short_name": "XSM",
            "description": "Buy and Sell Digital Assets",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": "#FF6B35",
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
        console.log('✅ Created site.webmanifest');

        console.log('\n🎉 Favicon optimization complete!');
        console.log('📋 Features:');
        console.log('   • Circular design that fits browser tabs perfectly');
        console.log('   • High contrast white text on gradient background');
        console.log('   • Multiple sizes for all devices and platforms');
        console.log('   • Optimized for small sizes with clear readability');
        console.log('   • Modern gradient design');
        console.log('\n🔧 The favicon should now display perfectly in:');
        console.log('   • Browser tabs (16x16, 32x32)');
        console.log('   • Bookmarks and browser UI');
        console.log('   • iOS home screen (180x180)');
        console.log('   • Android home screen (192x192, 512x512)');
        console.log('   • Progressive Web App icons');

    } catch (error) {
        console.error('❌ Error creating favicon:', error.message);
        
        if (error.message.includes('canvas')) {
            console.log('\n💡 To install canvas dependency:');
            console.log('   npm install canvas');
            console.log('   or');
            console.log('   yarn add canvas');
        }
    }
}

// Run the favicon creation
createOptimizedFavicon();
