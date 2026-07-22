import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// High resolution full launcher icon SVG (512x512)
const fullIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="gearGrad" x1="120" y1="120" x2="392" y2="392" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#3730a3"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="180" y1="180" x2="332" y2="332" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#4f46e5" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  
  <!-- Outer Accent Circle Ring -->
  <circle cx="256" cy="256" r="190" stroke="#334155" stroke-width="4" stroke-dasharray="8 8" opacity="0.6"/>

  <!-- Main Gear / Auto Part Graphic Group -->
  <g filter="url(#glow)">
    <!-- Central Gear Outer Ring -->
    <path d="
      M 256,120
      L 272,120 L 278,140 A 130,130 0 0,1 316,156 L 334,144 L 348,158 L 336,176
      A 130,130 0 0,1 352,214 L 372,220 L 372,240 L 372,256 L 372,272 L 352,278
      A 130,130 0 0,1 336,316 L 348,334 L 334,348 L 316,336
      A 130,130 0 0,1 278,352 L 272,372 L 256,372 L 240,372 L 234,352
      A 130,130 0 0,1 196,336 L 178,348 L 164,334 L 176,316
      A 130,130 0 0,1 160,278 L 140,272 L 140,256 L 140,240 L 160,234
      A 130,130 0 0,1 176,196 L 164,178 L 178,164 L 196,176
      A 130,130 0 0,1 234,160 L 240,140 Z
    " fill="url(#gearGrad)"/>

    <!-- Inner Gear Rim -->
    <circle cx="256" cy="256" r="92" fill="#0f172a" stroke="#6366f1" stroke-width="6"/>

    <!-- Crossed Wrench & Piston Emblem inside Gear -->
    <!-- Wrench 1 (Diagonal Left-to-Right) -->
    <g transform="translate(256,256) rotate(45) translate(-256,-256)">
      <rect x="244" y="180" width="24" height="152" rx="12" fill="#f8fafc"/>
      <!-- Wrench head top -->
      <path d="M 232,184 C 232,168 280,168 280,184 C 280,192 268,196 256,196 C 244,196 232,192 232,184 Z" fill="#f8fafc"/>
      <!-- Wrench head bottom -->
      <path d="M 232,328 C 232,344 280,344 280,328 C 280,320 268,316 256,316 C 244,316 232,320 232,328 Z" fill="#f8fafc"/>
    </g>

    <!-- Wrench 2 / Spark Plug (Diagonal Right-to-Left) -->
    <g transform="translate(256,256) rotate(-45) translate(-256,-256)">
      <rect x="244" y="180" width="24" height="152" rx="12" fill="url(#accentGrad)"/>
      <circle cx="256" cy="256" r="28" fill="#1e1b4b" stroke="url(#accentGrad)" stroke-width="8"/>
    </g>

    <!-- Central Glowing Core -->
    <circle cx="256" cy="256" r="16" fill="#f59e0b"/>
  </g>

  <!-- Top Lighting Highlight -->
  <path d="M 112,0 L 400,0 C 462,0 512,50 512,112 L 512,160 C 350,120 162,120 0,160 L 0,112 C 0,50 50,0 112,0 Z" fill="#ffffff" opacity="0.08"/>
</svg>
`;

// Adaptive Icon Foreground SVG (108x108 dp viewport, safe center 66x66)
const foregroundIconSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fgGearGrad" x1="100" y1="100" x2="332" y2="332" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
    <linearGradient id="fgAccentGrad" x1="140" y1="140" x2="292" y2="292" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="fgGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#4f46e5" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Centered inside 432x432 (viewport for adaptive icon) -->
  <g filter="url(#fgGlow)">
    <!-- Gear -->
    <path d="
      M 216,108
      L 229,108 L 234,124 A 104,104 0 0,1 264,137 L 279,127 L 290,138 L 280,153
      A 104,104 0 0,1 293,183 L 309,188 L 309,204 L 309,216 L 309,228 L 293,233
      A 104,104 0 0,1 280,263 L 290,278 L 279,289 L 264,279
      A 104,104 0 0,1 234,292 L 229,308 L 216,308 L 203,308 L 198,292
      A 104,104 0 0,1 168,279 L 153,289 L 142,278 L 152,263
      A 104,104 0 0,1 139,233 L 123,228 L 123,216 L 123,204 L 139,188
      A 104,104 0 0,1 152,158 L 142,143 L 153,132 L 168,142
      A 104,104 0 0,1 198,129 L 203,113 Z
    " fill="url(#fgGearGrad)"/>

    <!-- Inner Circle -->
    <circle cx="216" cy="216" r="74" fill="#0f172a" stroke="#818cf8" stroke-width="5"/>

    <!-- Crossed Tools -->
    <g transform="translate(216,216) rotate(45) translate(-216,-216)">
      <rect x="206" y="156" width="20" height="120" rx="10" fill="#f8fafc"/>
    </g>

    <g transform="translate(216,216) rotate(-45) translate(-216,-216)">
      <rect x="206" y="156" width="20" height="120" rx="10" fill="url(#fgAccentGrad)"/>
      <circle cx="216" cy="216" r="22" fill="#1e1b4b" stroke="url(#fgAccentGrad)" stroke-width="6"/>
    </g>

    <!-- Glowing Core -->
    <circle cx="216" cy="216" r="12" fill="#f59e0b"/>
  </g>
</svg>
`;

async function generateIcons() {
  console.log("Generating Auto Parts Marketplace app icons...");

  const resDir = './android/app/src/main/res';
  
  // Create 512x512 PNG buffer
  const fullBuffer = await sharp(Buffer.from(fullIconSvg))
    .resize(512, 512)
    .png()
    .toBuffer();

  // Create Round 512x512 PNG buffer (masked to circle)
  const roundMaskSvg = `
    <svg width="512" height="512">
      <circle cx="256" cy="256" r="256" fill="#fff"/>
    </svg>
  `;
  const roundBuffer = await sharp(fullBuffer)
    .composite([{ input: Buffer.from(roundMaskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Save to public directory for Web / PWA / App header
  if (!fs.existsSync('./public')) fs.mkdirSync('./public', { recursive: true });
  fs.writeFileSync('./public/icon.png', fullBuffer);
  fs.writeFileSync('./public/app-icon.png', fullBuffer);
  console.log("Saved web icons in /public/");

  // Define mipmap densities and sizes
  const densities = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  for (const { dir, size, fgSize } of densities) {
    const targetPath = path.join(resDir, dir);
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    // 1. ic_launcher.png (Legacy square icon)
    await sharp(fullBuffer)
      .resize(size, size)
      .toFile(path.join(targetPath, 'ic_launcher.png'));

    // 2. ic_launcher_round.png (Legacy round icon)
    await sharp(roundBuffer)
      .resize(size, size)
      .toFile(path.join(targetPath, 'ic_launcher_round.png'));

    // 3. ic_launcher_foreground.png (Adaptive icon foreground)
    await sharp(Buffer.from(foregroundIconSvg))
      .resize(fgSize, fgSize)
      .toFile(path.join(targetPath, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${dir} (size: ${size}px, fg: ${fgSize}px)`);
  }

  // Update background color XML
  const bgXmlPath = path.join(resDir, 'values/ic_launcher_background.xml');
  fs.writeFileSync(bgXmlPath, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0f172a</color>
</resources>
`);
  console.log("Updated ic_launcher_background.xml color to #0f172a");

  // Create mipmap-anydpi-v26 xmls for adaptive icons
  const v26Dir = path.join(resDir, 'mipmap-anydpi-v26');
  if (!fs.existsSync(v26Dir)) fs.mkdirSync(v26Dir, { recursive: true });

  fs.writeFileSync(path.join(v26Dir, 'ic_launcher.xml'), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`);

  fs.writeFileSync(path.join(v26Dir, 'ic_launcher_round.xml'), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`);
  console.log("Updated mipmap-anydpi-v26 ic_launcher.xml & ic_launcher_round.xml");

  console.log("All Auto Parts Marketplace icons generated successfully!");
}

generateIcons().catch(console.error);
