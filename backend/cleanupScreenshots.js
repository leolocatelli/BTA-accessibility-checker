import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔁 Caminho ajustado para salvar dentro de accessibility-checker/public
const screenshotDir = path.join(__dirname, "../../public/screenshots");

export function cleanupScreenshots() {
  if (!fs.existsSync(screenshotDir)) return;

  const files = fs.readdirSync(screenshotDir);
  const now = Date.now();
  const EXPIRATION_TIME = 1 * 60 * 1000; // ⏳ 1 minute

  files.forEach((file) => {
    const filePath = path.join(screenshotDir, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtimeMs > EXPIRATION_TIME) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old screenshot: ${filePath}`);
      } catch (err) {
        console.error(`❌ Failed to delete ${filePath}:`, err);
      }
    }
  });
}
