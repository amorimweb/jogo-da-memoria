const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "resources");
fs.mkdirSync(outDir, { recursive: true });

const SIZE = 1024;
const SPLASH = 2732;
const BG = "#cdeffd";

async function run() {
  // App icon: upscale the existing 512x512 PWA icon to the 1024x1024 Capacitor wants.
  await sharp(path.join(root, "assets", "icon-512.png"))
    .resize(SIZE, SIZE, { kernel: "lanczos3" })
    .png()
    .toFile(path.join(outDir, "icon.png"));

  // Splash: site's background color with the icon centered, same as the PWA splash feel.
  const iconOnSplash = Math.round(SPLASH * 0.38);
  const resizedIcon = await sharp(path.join(root, "assets", "icon-512.png"))
    .resize(iconOnSplash, iconOnSplash, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const splash = sharp({
    create: {
      width: SPLASH,
      height: SPLASH,
      channels: 4,
      background: BG
    }
  }).composite([
    { input: resizedIcon, gravity: "center" }
  ]);

  await splash.png().toFile(path.join(outDir, "splash.png"));
  await splash.png().toFile(path.join(outDir, "splash-dark.png"));

  console.log("Icons generated in /resources from assets/icon-512.png");
}

run();
