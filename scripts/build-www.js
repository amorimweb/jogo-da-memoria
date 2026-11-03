// Copies the static site into www/ (Capacitor's webDir), excluding
// tooling/build folders so `cap sync` doesn't recurse into itself.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dest = path.join(root, "www");

const EXCLUDE = new Set([
  "www", "ios", "android", "node_modules", ".git", ".claude",
  "scripts", "resources", "package.json", "package-lock.json",
  "capacitor.config.json", "codemagic.yaml", "vercel.json",
  ".gitignore", "README.md"
]);

function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dst, entry));
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

for (const entry of fs.readdirSync(root)) {
  if (EXCLUDE.has(entry)) continue;
  copyRecursive(path.join(root, entry), path.join(dest, entry));
}

console.log("www/ built from site sources.");
