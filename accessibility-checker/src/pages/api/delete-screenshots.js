import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const screenshotDir = path.join(process.cwd(), "public", "screenshots");

  if (!fs.existsSync(screenshotDir)) {
    console.log("✅ No screenshots to delete.");
    return res.status(200).json({ message: "No screenshots to delete" });
  }

  try {
    const files = fs.readdirSync(screenshotDir);
    if (files.length === 0) {
      console.log("✅ No screenshots found to delete.");
      return res.status(200).json({ message: "No screenshots found" });
    }

    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(screenshotDir, file);

      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`🗑️ Deleted screenshot: ${filePath}`);
      } catch (err) {
        console.error(`❌ Error deleting screenshot: ${filePath}`, err);
      }
    }

    return res.status(200).json({ message: `Deleted ${deletedCount} screenshots` });
  } catch (err) {
    console.error("❌ Error reading screenshots folder:", err);
    return res.status(500).json({ message: "Error reading screenshots folder" });
  }
}
