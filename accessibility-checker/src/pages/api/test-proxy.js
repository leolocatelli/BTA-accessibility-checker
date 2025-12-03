// src/pages/api/test-proxy.js
import { HttpsProxyAgent } from "https-proxy-agent";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ error: "Use GET /api/test-proxy?url=https://example.com" });
  }

  const targetUrl = req.query.url;

  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).json({ error: "Missing url query param" });
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    return res
      .status(400)
      .json({ error: "URL must start with http or https" });
  }

  const proxyUrl = process.env.QUOTAGUARDSTATIC_URL;
  if (!proxyUrl) {
    return res
      .status(500)
      .json({ error: "QUOTAGUARDSTATIC_URL is not set in env vars" });
  }

  try {
    const agent = new HttpsProxyAgent(proxyUrl);

    // Node 18+ tem fetch global; aqui usamos o proxy agent
    const response = await fetch(targetUrl, { agent });
    const text = await response.text();

    // devolve o HTML cru só pra teste
    res.status(200).send(text);
  } catch (err) {
    console.error("test-proxy error:", err);
    res
      .status(500)
      .json({ error: err.message || "Proxy request failed" });
  }
}
