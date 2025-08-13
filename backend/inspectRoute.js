// backend/inspectRoute.js
const puppeteer = require("puppeteer");
const sanitizeHtml = require("sanitize-html");

// -----------------------------
// Helpers (fora do browser)
// -----------------------------
async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    executablePath:
      process.env.CHROME_PATH ||
      (puppeteer.executablePath ? puppeteer.executablePath() : undefined),
    defaultViewport: null,
    dumpio: false,
  });
}

// “race” de timeout para evitar 504 no proxy
function withTimeout(promise, ms, label = "task") {
  return Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`TIMEOUT:${label}`)), ms)
    ),
  ]);
}

function injectBaseHref(html, pageUrl) {
  try {
    return /<base\s+href=/i.test(html)
      ? html
      : html.replace(/<head([^>]*)>/i, (m, a) => `<head${a}><base href="${pageUrl}">`);
  } catch {
    return html;
  }
}

function sanitize(html) {
  return sanitizeHtml(html, {
    allowedTags: false,
    disallowedTagsMode: "discard",
    exclusiveFilter: (f) => f.tag === "script",
    allowedAttributes: {
      "*": ["class","id","role","aria-*","data-*","style","title","href","src","type"],
      link: ["href","rel","media","as","crossorigin","integrity","referrerpolicy"],
      meta: ["charset","content","http-equiv","name","property"],
      base: ["href"],
    },
    transformTags: {
      "*": (tag, attrs) => {
        const clean = {};
        for (const [k, v] of Object.entries(attrs)) {
          if (!k.toLowerCase().startsWith("on")) clean[k] = v; // remove on*
        }
        return { tagName: tag, attribs: clean };
      },
    },
  });
}

// Constantes simples para page.evaluate
const FOCUSABLE = [
  "a[href]","button","input:not([type='hidden'])","textarea","select",
  "[contenteditable='true']","[tabindex]:not([tabindex='-1'])","[role='button']","[role='link']",
].join(",");

const OVERLAY_CSS = `
.a11y-mark{outline:2px dashed #2563eb!important;outline-offset:2px;position:relative!important}
.a11y-mark.a11y-hover{outline-width:3px!important}
.a11y-badge{
  position:absolute; top:-10px; left:-10px; z-index:2147483647;
  font:700 14px/1 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;
  background:#2563eb; color:#fff; border-radius:9999px; padding:3px 8px;
  box-shadow:0 1px 2px rgba(0,0,0,.25);
}
.a11y-mark.a11y-danger{ outline-color:#dc2626!important }
.a11y-mark.a11y-danger .a11y-badge{ background:#dc2626!important }
.a11y-mark.a11y-warning{ outline-color:#f59e0b!important }
.a11y-mark.a11y-warning .a11y-badge{ background:#f59e0b!important }
.a11y-mark:hover::after{ content:none }
.a11y-pop{
  position:fixed; left:16px; right:16px; bottom:16px; z-index:2147483647;
  background:#111; color:#fff; padding:14px 16px; border-radius:10px;
  font:500 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;
  box-shadow:0 10px 30px rgba(0,0,0,.35);
  max-height:42vh; overflow:auto;
}
.a11y-pop .a11y-pop-title{ font-weight:700; margin-bottom:6px }
.a11y-pop .a11y-pop-meta{ opacity:.9; margin-bottom:8px }
.a11y-pop .a11y-pop-close{
  position:absolute; top:8px; right:12px; cursor:pointer; border:none; background:transparent; color:#fff; font-size:18px;
}
#onetrust-banner-sdk,#onetrust-consent-sdk,#onetrust-pc-sdk,.ot-sdk-container,.ot-sdk-overlay,.cookie-banner,.cookie-consent,[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i]{display:none!important}
html.js .no-js-only,.js .no-js-only{display:none!important}
html.no-js .js-only,.no-js .js-only{display:none!important}
`;

async function processPage(page, { scope = "main", includeDialogs = false }) {
  // espera redes ficarem ociosas, mas com cap mais curto
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => {});
  return page.evaluate(
    ({ scope, includeDialogs, FOCUSABLE, OVERLAY_CSS }) => {
      // ---------- Helpers dentro do browser ----------
      const isVisible = (el) => {
        const s = window.getComputedStyle(el);
        if (!s || s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) return false;
        const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
      };
      const byIdText = (id) => (id && document.getElementById(id)?.innerText.trim()) || "";
      const getRole = (el) => el.getAttribute("role") || el.tagName.toLowerCase();
      const getName = (el) => {
        const ariaLabel = el.getAttribute("aria-label"); if (ariaLabel?.trim()) return ariaLabel.trim();
        const lbl = el.getAttribute("aria-labelledby"); if (lbl) {
          const t = lbl.split(/\s+/).map(byIdText).filter(Boolean).join(" ").trim(); if (t) return t;
        }
        const desc = el.getAttribute("aria-describedby"); if (desc) {
          const t = desc.split(/\s+/).map(byIdText).filter(Boolean).join(" ").trim(); if (t) return t;
        }
        if (el.tagName.toLowerCase() === "input" && el.type === "image") return el.getAttribute("alt")?.trim() || "";
        if (el.tagName.toLowerCase() === "a") {
          const img = el.querySelector("img[alt]"); if (img?.alt) return img.alt.trim();
        }
        return (el.innerText || "").trim();
      };

      // base href
      try {
        if (!document.querySelector("head base[href]")) {
          const base = document.createElement("base");
          base.href = String(window.location.href);
          document.head.prepend(base);
        }
      } catch {}

      // finge JS ligado + limpa avisos
      try {
        document.documentElement.classList.remove("no-js");
        document.documentElement.classList.add("js","has-js");
        const kill = (sel) => document.querySelectorAll(sel).forEach(n => n.remove());
        kill("#js-disabled, .js-disabled, .no-js-banner, [data-js-disabled], [data-noscript], .no-js-msg");
        const rx = /javascript (is|functionality is) turned off|enable javascript/i;
        for (const el of document.body.querySelectorAll("*")) {
          try {
            if (!el.childElementCount && rx.test(el.textContent || "")) el.closest("div,section,header,aside")?.remove();
          } catch {}
        }
      } catch {}

      // remove cookie UI
      try {
        const rmAll = (sel) => document.querySelectorAll(sel).forEach(n => n.remove());
        rmAll('#onetrust-banner-sdk, #onetrust-consent-sdk, #onetrust-pc-sdk, .ot-sdk-container, .ot-sdk-overlay, iframe[title="onetrust-text-resize"]');
        rmAll('.cookie-banner, .cookie-consent, [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i]');
        document.body.classList.remove('ot-sdk-overflow','ot--prevent-scroll','modal-open');
        document.documentElement.style.overflow = ''; document.body.style.overflow = '';
      } catch {}

      // escopo
      const mainById = document.querySelector('#main[role="main"]');
      const mainTag  = document.querySelector("main");
      const mainRole = document.querySelector('[role="main"]');
      const roots = [ scope === "full" ? document.body : (mainById || mainTag || mainRole || document.body) ];
      if (includeDialogs) document.querySelectorAll('[role="dialog"], [aria-modal="true"]').forEach(d => roots.push(d));

      // coleta
      const shouldIgnore = (el) =>
        scope !== "full" && el.closest("header, footer, [role='banner'], [role='contentinfo'], .site-header, .site-footer");

      const candidates = roots.flatMap(r => Array.from(r.querySelectorAll(FOCUSABLE)));
      const focusables = candidates.filter((el) =>
        !shouldIgnore(el) && !el.hasAttribute("disabled") && isVisible(el) && el.getAttribute("tabindex") !== "-1"
      );

      // ordena por tabindex>0 e depois DOM
      const withMeta = focusables.map((el, i) => {
        let id = el.getAttribute("data-a11y-id");
        if (!id) { id = `a11y-${Math.random().toString(36).slice(2, 9)}`; el.setAttribute("data-a11y-id", id); }
        const ti = el.getAttribute("tabindex"); const tabIndex = ti ? parseInt(ti, 10) : 0;
        return { el, id, tabIndex, domIndex: i, name: getName(el), tag: el.tagName.toLowerCase(), role: getRole(el) };
      }).sort((a,b) => {
        const ap = a.tabIndex > 0 ? 0 : 1, bp = b.tabIndex > 0 ? 0 : 1;
        return ap - bp || (ap === 0 ? (a.tabIndex - b.tabIndex || a.domIndex - b.domIndex) : a.domIndex - b.domIndex);
      });

      // overlay
      const style = document.createElement("style"); style.textContent = OVERLAY_CSS; document.head.appendChild(style);
      withMeta.forEach((m, i) => {
        const el = m.el; el.classList.add("a11y-mark");
        el.setAttribute("data-a11y-name", m.name || "⚠ No accessible name");
        const badge = document.createElement("span"); badge.className = "a11y-badge"; badge.textContent = String(i+1);
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        el.appendChild(badge); m.order = i+1;
      });

      const focusablesPayload = withMeta.map(m => ({
        id: m.id, tag: m.tag, role: m.role, tabIndex: m.tabIndex, order: m.order, accessibleName: m.name,
      }));

      const suspicious = focusablesPayload.filter(f => {
        const n = (f.accessibleName||"").trim().toLowerCase();
        return !n || n === "click here" || n === "learn more" || n.length <= 2;
      });

      return {
        html: document.documentElement.outerHTML,
        focusables: focusablesPayload,
        summary: {
          total: focusablesPayload.length,
          noName: focusablesPayload.filter(f => !f.accessibleName || !f.accessibleName.trim()).length,
          suspicious: suspicious.length,
        },
      };
    },
    { scope, includeDialogs, FOCUSABLE, OVERLAY_CSS }
  );
}

async function inspect(url, opts) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();

    // timeouts padrão mais curtos
    page.setDefaultNavigationTimeout(12000);
    page.setDefaultTimeout(7000);

    // Intercepta requests para acelerar e evitar travas
    await page.setRequestInterception(true);
    const BLOCK_TYPES = new Set(["image", "media", "font", "stylesheet"]);
    const BLOCK_HOSTS = [
      "googletagmanager.com",
      "google-analytics.com",
      "doubleclick.net",
      "facebook.net",
      "hotjar.com",
      "segment.com",
      "optimizely.com",
      "newrelic.com",
    ];
    page.on("request", (req) => {
      const url = req.url().toLowerCase();
      if (BLOCK_TYPES.has(req.resourceType())) return req.abort();
      if (BLOCK_HOSTS.some(h => url.includes(h))) return req.abort();
      return req.continue();
    });

    await page.setBypassCSP(true);

    // Navegação mais permissiva (evita networkidle0)
    try {
      await page.goto(url, { waitUntil: ["load", "domcontentloaded"], timeout: 12000 });
    } catch (e) {
      console.warn("Navigation warning:", e.message);
    }

    // Tenta “aceitar cookies” e simular JS
    try {
      await page.evaluate(() => {
        const clickFirst = (sels) => { for (const s of sels) { const n = document.querySelector(s); if (n) { n.click(); return true; } } return false; };
        clickFirst([
          '#onetrust-accept-btn-handler',
          '#accept-recommended-btn-handler',
          '.onetrust-accept-btn-handler',
          '.save-preference-btn-handler.onetrust-close-btn-handler',
          '.ot-pc-refuse-all-handler'
        ]);
        document.documentElement.classList.remove('no-js');
        document.documentElement.classList.add('js','has-js');
      });
      await page.waitForTimeout(400);
    } catch {}

    const data = await processPage(page, opts);
    const html = injectBaseHref(sanitize(data.html), url);
    return { html, focusables: data.focusables, summary: data.summary };
  } finally {
    await browser.close().catch(() => {});
  }
}

// -----------------------------
// Rota Express (export)
// -----------------------------
function registerInspectRoute(app) {
  app.post("/api/inspect", async (req, res) => {
    const T_MAX = 25000; // 25s: abaixo do corte do proxy + bom UX
    try {
      const { url, scope = "main", includeDialogs = false } = req.body || {};
      if (!url) return res.status(400).json({ error: "Missing url" });

      const data = await withTimeout(
        inspect(url, { scope, includeDialogs }),
        T_MAX,
        "inspect"
      );

      return res.json(data);
    } catch (err) {
      const msg = String(err && err.message || err || "");
      const isTimeout = msg.startsWith("TIMEOUT:");
      console.error("inspect error:", msg);
      return res
        .status(isTimeout ? 504 : 500)
        .json({ ok: false, error: isTimeout ? "Request timed out while inspecting the page." : msg });
    }
  });
}

module.exports = { registerInspectRoute };
