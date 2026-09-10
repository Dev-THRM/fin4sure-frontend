import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "dist");
const targetDir = path.resolve(__dirname, "../fin4sure-backend/client");

try {
  if (fs.existsSync(srcDir) && fs.existsSync(path.resolve(__dirname, "../fin4sure-backend"))) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.cpSync(srcDir, targetDir, { recursive: true, force: true });
    console.log(`✓ Successfully copied dist build to ${targetDir}`);
  }
} catch (err) {
  // If backend repo is not present (e.g. standalone Vercel CI environment), ignore safely
  console.log("Note: Backend client directory not present or not accessible, skipping local copy.");
}
