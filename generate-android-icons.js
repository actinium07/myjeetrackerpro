import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const mipmaps = [
  { dir: 'app/src/main/res/mipmap-mdpi', size: 48 },
  { dir: 'app/src/main/res/mipmap-hdpi', size: 72 },
  { dir: 'app/src/main/res/mipmap-xhdpi', size: 96 },
  { dir: 'app/src/main/res/mipmap-xxhdpi', size: 144 },
  { dir: 'app/src/main/res/mipmap-xxxhdpi', size: 192 },
];

async function generate() {
  for (const m of mipmaps) {
    fs.mkdirSync(m.dir, { recursive: true });
    await sharp(svgBuffer)
      .resize(m.size, m.size)
      .png()
      .toFile(path.join(m.dir, 'ic_launcher.png'));
  }
  console.log('Android mipmap icons generated successfully!');
}

generate().catch(console.error);
