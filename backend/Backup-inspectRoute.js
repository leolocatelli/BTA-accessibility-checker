// const puppeteer = require("puppeteer");
// const sanitizeHtml = require("sanitize-html");

// // Launch Puppeteer with robust defaults
// async function launchBrowser() {
//   return puppeteer.launch({
//     headless: true,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-dev-shm-usage",
//       "--disable-gpu",
//     ],
//     executablePath:
//       process.env.CHROME_PATH ||
//       (puppeteer.executablePath ? puppeteer.executablePath() : undefined),
//     defaultViewport: null,
//     dumpio: false,
//   });
// }

// // Garante <base href="..."> no HTML já sanitizado
// function injectBaseHref(html, pageUrl) {
//   try {
//     const hasBase = /<base\s+href=/i.test(html);
//     if (hasBase) return html;
//     // insere logo após <head ...>
//     return html.replace(
//       /<head([^>]*)>/i,
//       (m, attrs) => `<head${attrs}><base href="${pageUrl}">`
//     );
//   } catch {
//     return html;
//   }
// }

// // Process page and inject overlay
// async function processPage(page, { scope = "main", includeDialogs = false }) {
//   await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }).catch(() => {});

//   const data = await page.evaluate(({ scope, includeDialogs }) => {
//     // ---------- helpers ----------
//     const isVisible = (el) => {
//       const s = window.getComputedStyle(el);
//       if (!s) return false;
//       if (s.display === "none" || s.visibility === "hidden" || parseFloat(s.opacity || "1") === 0) return false;
//       const rect = el.getBoundingClientRect();
//       return rect.width > 0 && rect.height > 0;
//     };

//     const getByIdText = (id) => {
//       if (!id) return "";
//       const node = document.getElementById(id);
//       return node ? node.innerText.trim() : "";
//     };

//     const getAccessibleName = (el) => {
//       const ariaLabel = el.getAttribute("aria-label");
//       if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

//       const labelledby = el.getAttribute("aria-labelledby");
//       if (labelledby) {
//         const txt = labelledby
//           .split(/\s+/)
//           .map((id) => getByIdText(id))
//           .filter(Boolean)
//           .join(" ")
//           .trim();
//         if (txt) return txt;
//       }

//       const describedby = el.getAttribute("aria-describedby");
//       if (describedby) {
//         const txt = describedby
//           .split(/\s+/)
//           .map((id) => getByIdText(id))
//           .filter(Boolean)
//           .join(" ")
//           .trim();
//         if (txt) return txt;
//       }

//       if (el.tagName.toLowerCase() === "input" && el.type === "image") {
//         const alt = el.getAttribute("alt");
//         if (alt) return alt.trim();
//       }
//       if (el.tagName.toLowerCase() === "a") {
//         const img = el.querySelector("img[alt]");
//         if (img && img.getAttribute("alt")) return img.getAttribute("alt").trim();
//       }

//       const text = (el.innerText || "").trim();
//       return text;
//     };

//     const getRole = (el) => el.getAttribute("role") || el.tagName.toLowerCase();

//     const focusableSelector = [
//       "a[href]",
//       "button",
//       "input:not([type='hidden'])",
//       "textarea",
//       "select",
//       "[contenteditable='true']",
//       "[tabindex]:not([tabindex='-1'])",
//       "[role='button']",
//       "[role='link']",
//     ].join(",");

//     // ---------- define escopo ----------
//     let roots = [];
//     const mainById = document.querySelector('#main[role="main"]');
//     const mainTag  = document.querySelector("main");
//     const mainRole = document.querySelector('[role="main"]');

//     if (scope === "full") {
//       roots = [document.body];
//     } else {
//       roots = [mainById || mainTag || mainRole || document.body];
//     }

//     if (includeDialogs) {
//       document.querySelectorAll('[role="dialog"], [aria-modal="true"]').forEach((d) => roots.push(d));
//     }

//     // --- garante que recursos relativos funcionem em srcDoc ---
//     (function ensureBaseHref() {
//       try {
//         const hasBase = !!document.querySelector("head base[href]");
//         if (!hasBase) {
//           const base = document.createElement("base");
//           base.setAttribute("href", String(window.location.href));
//           document.head.prepend(base);
//         }
//       } catch (e) { /* no-op */ }
//     })();

//     // --- simula JS habilitado e remove avisos "JS desligado" ---
//     (function simulateJsEnabled() {
//       try {
//         document.documentElement.classList.remove("no-js");
//         document.documentElement.classList.add("js", "has-js");

//         const kill = (sel) => document.querySelectorAll(sel).forEach(n => n.remove());
//         kill("#js-disabled, .js-disabled, .no-js-banner, [data-js-disabled], [data-noscript], .no-js-msg");

//         const rx = /javascript (is|functionality is) turned off|enable javascript/i;
//         Array.from(document.body.querySelectorAll("*")).forEach(el => {
//           try {
//             if (el.childElementCount) return;
//             if (rx.test(el.textContent || "")) el.closest("div, section, header, aside")?.remove();
//           } catch {}
//         });
//       } catch {}
//     })();

//     // --- remove/neutraliza UI de cookies (OneTrust e afins) ---
//     (function killCookieUI() {
//       try {
//         const removeAll = (sel) =>
//           document.querySelectorAll(sel).forEach((n) => n.remove());

//         // OneTrust e elementos relacionados
//         removeAll('#onetrust-banner-sdk');
//         removeAll('#onetrust-consent-sdk');
//         removeAll('#onetrust-pc-sdk');
//         removeAll('.ot-sdk-container');
//         removeAll('.ot-sdk-overlay');
//         removeAll('iframe[title="onetrust-text-resize"]');

//         // Genéricos
//         removeAll('.cookie-banner');
//         removeAll('.cookie-consent');
//         removeAll('[id*="cookie" i]');
//         removeAll('[class*="cookie" i]');
//         removeAll('[id*="consent" i]');
//         removeAll('[class*="consent" i]');

//         // Reabilita scroll/interação se bloqueado
//         document.body.classList.remove('ot-sdk-overflow', 'ot--prevent-scroll', 'modal-open');
//         document.documentElement.style.overflow = '';
//         document.body.style.overflow = '';
//       } catch (e) { /* no-op */ }
//     })();

//     // ---------- coleta bruto ----------
//     let candidates = [];
//     roots.forEach((root) => {
//       candidates.push(...root.querySelectorAll(focusableSelector));
//     });

//     // exclusões globais quando scope = main
//     const shouldIgnore = (el) => {
//       return (
//         scope !== "full" &&
//         el.closest("header, footer, [role='banner'], [role='contentinfo'], .site-header, .site-footer")
//       );
//     };

//     // filtra visíveis, não ignorados e não tabindex -1/disabled
//     let focusables = candidates.filter((el) => {
//       if (shouldIgnore(el)) return false;
//       if (el.hasAttribute("disabled")) return false;
//       if (!isVisible(el)) return false;
//       const tabindex = el.getAttribute("tabindex");
//       if (tabindex === "-1") return false;
//       return true;
//     });

//     // ordenação: tabindex > 0 primeiro (asc), depois DOM
//     const withMeta = focusables.map((el, i) => {
//       let id = el.getAttribute("data-a11y-id");
//       if (!id) {
//         id = `a11y-${Math.random().toString(36).slice(2, 9)}`;
//         el.setAttribute("data-a11y-id", id);
//       }
//       const tabIndexAttr = el.getAttribute("tabindex");
//       const tabIndex = tabIndexAttr ? parseInt(tabIndexAttr, 10) : 0;

//       return {
//         el,
//         id,
//         tabIndex,
//         domIndex: i,
//         name: getAccessibleName(el),
//         tag: el.tagName.toLowerCase(),
//         role: getRole(el),
//       };
//     });

//     withMeta.sort((a, b) => {
//       const aPos = a.tabIndex > 0 ? 0 : 1;
//       const bPos = b.tabIndex > 0 ? 0 : 1;
//       if (aPos !== bPos) return aPos - bPos;
//       if (aPos === 0) return a.tabIndex - b.tabIndex || a.domIndex - b.domIndex;
//       return a.domIndex - b.domIndex;
//     });

//     // injeta CSS global para outlines/badges/popups + “apaga” header/footer se scope = main
//     const style = document.createElement("style");
//     style.textContent = `
//       .a11y-mark { outline: 2px dashed #2563eb !important; outline-offset: 2px; position: relative !important; }
//       .a11y-mark.a11y-hover { outline-width: 3px !important; }
//       .a11y-badge {
//         position:absolute; top:-8px; left:-8px; z-index:2147483647;
//         font: 600 12px/1 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;
//         background:#2563eb; color:#fff; border-radius:9999px; padding:2px 6px;
//         box-shadow:0 1px 2px rgba(0,0,0,.2);
//       }
//       .a11y-mark:hover::after{
//         content: attr(data-a11y-name);
//         position:absolute; left:0; top:-32px; max-width:320px;
//         background:#111; color:#fff; padding:6px 8px; border-radius:6px;
//         z-index:2147483647; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
//         font: 500 12px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;
//       }
//       ${scope !== "full" ? `
//         header, [role="banner"], footer, [role="contentinfo"], .site-header, .site-footer {
//           pointer-events:none !important;
//           opacity:.35 !important;
//         }
//       ` : ""}

//       /* Hide common cookie/consent banners (fallback por CSS) */
//       #onetrust-banner-sdk,
//       #onetrust-consent-sdk,
//       #onetrust-pc-sdk,
//       .ot-sdk-container,
//       .ot-sdk-overlay,
//       .cookie-banner,
//       .cookie-consent,
//       [id*="cookie" i],
//       [class*="cookie" i],
//       [id*="consent" i],
//       [class*="consent" i] {
//         display: none !important;
//       }

//       /* JS on/off helpers */
//       html.js .no-js-only, .js .no-js-only { display:none !important; }
//       html.no-js .js-only, .no-js .js-only { display:none !important; }
//     `;
//     document.head.appendChild(style);

//     // aplica marcações
//     withMeta.forEach((m, idx) => {
//       const el = m.el;
//       el.classList.add("a11y-mark");
//       el.setAttribute("data-a11y-name", m.name || "⚠ No accessible name");
//       const badge = document.createElement("span");
//       badge.className = "a11y-badge";
//       badge.textContent = String(idx + 1);
//       const cs = window.getComputedStyle(el);
//       if (cs.position === "static") el.style.position = "relative";
//       el.appendChild(badge);
//       m.order = idx + 1;
//     });

//     const focusablesPayload = withMeta.map((m) => ({
//       id: m.id,
//       tag: m.tag,
//       role: m.role,
//       tabIndex: m.tabIndex,
//       order: m.order,
//       accessibleName: m.name,
//     }));

//     const suspicious = focusablesPayload.filter((f) => {
//       const n = (f.accessibleName || "").trim().toLowerCase();
//       return !n || n === "click here" || n === "learn more" || n.length <= 2;
//     });

//     const summary = {
//       total: focusablesPayload.length,
//       noName: focusablesPayload.filter((f) => !f.accessibleName || !f.accessibleName.trim()).length,
//       suspicious: suspicious.length,
//     };

//     return {
//       html: document.documentElement.outerHTML,
//       focusables: focusablesPayload,
//       summary,
//     };
//   }, { scope, includeDialogs });

//   // sanitização: remove <script> e handlers on*, preserva attrs importantes
//   const sanitized = sanitizeHtml(data.html, {
//     allowedTags: false,
//     disallowedTagsMode: "discard",
//     exclusiveFilter(frame) {
//       return frame.tag === "script";
//     },
//     allowedAttributes: {
//       "*": ["class", "id", "role", "aria-*", "data-*", "style", "title", "href", "src", "type"],
//       link: ["href", "rel", "media", "as", "crossorigin", "integrity", "referrerpolicy"],
//       meta: ["charset", "content", "http-equiv", "name", "property"],
//       base: ["href"],
//     },
//     transformTags: {
//       "*": (tagName, attribs) => {
//         const clean = {};
//         for (const [k, v] of Object.entries(attribs)) {
//           if (k.toLowerCase().startsWith("on")) continue; // remove onclick etc
//           clean[k] = v;
//         }
//         return { tagName, attribs: clean };
//       },
//     },
//   });

//   return { html: sanitized, focusables: data.focusables, summary: data.summary };
// }

// async function inspect(url, opts) {
//   const browser = await launchBrowser();
//   try {
//     const page = await browser.newPage();
//     await page.setBypassCSP(true);

//     try {
//       await page.goto(url, { waitUntil: ["domcontentloaded", "networkidle0"], timeout: 15000 });
//     } catch (err) {
//       console.warn("Navigation warning:", err.message);
//     }

//     // tenta aceitar/fechar consentimentos comuns (OneTrust) e simular JS ativo
//     try {
//       await page.evaluate(() => {
//         const clickFirst = (sels) => {
//           for (const s of sels) {
//             const b = document.querySelector(s);
//             if (b) { b.click(); return true; }
//           }
//           return false;
//         };
//         clickFirst([
//           '#onetrust-accept-btn-handler',
//           '#accept-recommended-btn-handler',
//           '.onetrust-accept-btn-handler',
//           '.save-preference-btn-handler.onetrust-close-btn-handler',
//           '.ot-pc-refuse-all-handler' // opcional
//         ]);

//         document.documentElement.classList.remove('no-js');
//         document.documentElement.classList.add('js','has-js');
//       });
//       await page.waitForTimeout(600);
//     } catch (_) { /* no-op */ }

//     const data = await processPage(page, opts);

//     // 🔧 garante <base href="..."> depois da sanitização também
//     data.html = injectBaseHref(data.html, url);

//     return data;
//   } finally {
//     await browser.close().catch(() => {});
//   }
// }

// function registerInspectRoute(app) {
//   app.post("/api/inspect", async (req, res) => {
//     try {
//       const { url, scope = "main", includeDialogs = false } = req.body || {};
//       if (!url) return res.status(400).json({ error: "Missing url" });

//       const data = await inspect(url, { scope, includeDialogs });
//       return res.json(data);
//     } catch (err) {
//       console.error("inspect error:", err.stack || err);
//       return res.status(500).send(err.message || "Inspect failure");
//     }
//   });
// }

// module.exports = { registerInspectRoute };
