// accessibility-checker/src/pages/api/audit.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url, checks } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      return res
        .status(500)
        .json({ error: "Backend URL not configured (NEXT_PUBLIC_API_URL)" });
    }

    const runImages = !!checks?.images;
    const runWcag = !!checks?.wcag;
    const runAria = !!checks?.aria;

    // ✅ Important:
    // /api/check is where load time + images extraction happens (Checker behavior)
    // so we must call it whenever images OR wcag is requested
    const shouldRunCheck = runImages || runWcag;

    const checkPromise = shouldRunCheck
      ? fetch(`${baseUrl}/api/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }).then((r) => r.json())
      : Promise.resolve(null);

    const ariaPromise = runAria
      ? fetch(`${baseUrl}/api/inspect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }).then((r) => r.json())
      : Promise.resolve(null);

    const [checkResult, ariaResult] = await Promise.all([
      checkPromise,
      ariaPromise,
    ]);

    // ✅ Load time mapping (field name may vary depending on backend)
    const loadTime =
      checkResult?.loadTime ??
      checkResult?.fullLoadTime ??
      checkResult?.performance?.loadTime ??
      checkResult?.performance?.fullLoadTime ??
      checkResult?.timing?.loadTime ??
      checkResult?.timing?.fullLoadTime ??
      null;

    const unified = {
      url,

      // ✅ images come from /api/check
      images: runImages ? checkResult?.images || [] : null,

      // ✅ wcag only if user requested
      wcag: runWcag
        ? {
            score: checkResult?.score ?? checkResult?.wcagScore ?? null,
            violations:
              checkResult?.violations ??
              checkResult?.results?.violations ??
              checkResult?.axe?.violations ??
              [],
          }
        : null,

      // ✅ performance is returned when images is requested (so Full Load Time works)
      performance: runImages ? { loadTime } : null,

      // ✅ aria from /api/inspect
      aria: runAria ? ariaResult || null : null,
    };

    return res.status(200).json(unified);
  } catch (err) {
    console.error("Error in /api/audit:", err);
    return res.status(500).json({
      error: "Unified audit failed",
      details: err.message,
    });
  }
}
