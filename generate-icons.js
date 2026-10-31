import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  // 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public/pwa-192x192.png'));

  // 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/pwa-512x512.png'));

  // 512x512 Maskable PNG with 15% safe padding
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: '#020617',
    })
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));

  // 180x180 Apple Touch Icon (No alpha for iOS Safari)
  await sharp(svgBuffer)
    .resize(180, 180)
    .flatten({ background: '#020617' })
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));

  // Favicon 64x64 PNG
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.resolve('public/favicon.ico'));

  console.log('Successfully generated all PWA icons & Apple Touch Icon!');
}

generate().catch(console.error);
