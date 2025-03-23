async function extractVideos(page) {
  console.log("📹 Extracting videos...");

  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll("video")).map((video) => {
      const src = video.src || video.querySelector("source")?.src || "(No source)";
      const hasCaptions = video.querySelector("track[kind='subtitles'], track[kind='captions']") !== null;
      return { src, hasCaptions };
    });
  });
}

module.exports = { extractVideos };
