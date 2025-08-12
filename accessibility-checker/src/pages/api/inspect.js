// pages/api/inspect.js

export const config = {
  api: {
    bodyParser: { sizeLimit: "1mb" },
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  // sempre resposta fresca
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url, scope = "main", includeDialogs = false } = req.body || {};

    // validação básica
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing url" });
    }
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: "URL must start with http or https" });
    }

    // normaliza params
    const allowedScopes = new Set(["main", "full"]);
    const normalizedScope = allowedScopes.has(scope) ? scope : "main";
    const normalizedIncludeDialogs = Boolean(includeDialogs);

    // base do backend (sem barra final)
    const baseEnv = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const base = baseEnv.replace(/\/+$/, "");

    // timeout configurável
    const controller = new AbortController();
    const timeoutMs = Number(process.env.INSPECT_TIMEOUT_MS || 25000);
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const upstream = await fetch(`${base}/api/inspect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Inspect-Scope": normalizedScope,
      },
      body: JSON.stringify({
        url,
        scope: normalizedScope,
        includeDialogs: normalizedIncludeDialogs,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    // lê como texto e tenta parsear
    const text = await upstream.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* mantém null */
    }

    if (!upstream.ok) {
      const msg = data?.error || text || "Upstream error";
      return res.status(upstream.status).json({ error: msg });
    }

    if (!data || typeof data !== "object" || !("html" in data)) {
      return res.status(502).json({ error: "Invalid upstream response" });
    }

    return res.status(200).json(data);
  } catch (err) {
    if (err?.name === "AbortError") {
      return res
        .status(504)
        .json({ error: "Upstream timeout (inspect request aborted)" });
    }
    return res
      .status(500)
      .json({ error: err?.message || "Proxy failure in /api/inspect" });
  }
}
