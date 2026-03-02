const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imageDir = path.join(__dirname, '../public/images/result');

const pngFiles = [
    'black  paper high res.png',
    'explore_hero_bg.png',
    'explore_top_india_map_right.png',
    'orange paper.png',
];

async function convertToWebP(filename) {
    const inputPath = path.join(imageDir, filename);
    const outputName = filename.replace(/\.png$/i, '.webp');
    const outputPath = path.join(imageDir, outputName);

    try {
        const inputStats = fs.statSync(inputPath);
        const inputSizeMB = (inputStats.size / 1024 / 1024).toFixed(2);

        await sharp(inputPath)
            .webp({ quality: 82, effort: 6 })
            .toFile(outputPath);

        const outputStats = fs.statSync(outputPath);
        const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
        const reduction = (((inputStats.size - outputStats.size) / inputStats.size) * 100).toFixed(1);

        console.log(`✅ ${filename}`);
        console.log(`   ${inputSizeMB} MB → ${outputSizeMB} MB (${reduction}% smaller)\n`);
    } catch (err) {
        console.error(`❌ Failed to convert ${filename}:`, err.message);
    }
}

(async () => {
    console.log('🔄 Converting PNG files to WebP...\n');
    for (const file of pngFiles) {
        await convertToWebP(file);
    }
    console.log('✨ Done! You can now delete the original .png files if the .webp files look correct.');
})();
