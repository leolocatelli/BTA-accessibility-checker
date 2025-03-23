async function measureLoadTime(page) {
  try {
    const navigationTiming = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });

    const loadTimeInSeconds = (navigationTiming / 1000).toFixed(2);
    return loadTimeInSeconds;
  } catch (error) {
    console.error("❌ Error measuring page load time:", error);
    return null;
  }
}

module.exports = { measureLoadTime };
