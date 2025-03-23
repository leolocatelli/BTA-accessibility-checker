const fs = require("fs");
const path = require("path");

const screenshotDir = path.join(__dirname, "public/screenshots");

function cleanupScreenshots() {
  if (!fs.existsSync(screenshotDir)) return;

  const files = fs.readdirSync(screenshotDir);
  const now = Date.now();
  const EXPIRATION_TIME = 1 * 60 * 1000;

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

module.exports = { cleanupScreenshots };
