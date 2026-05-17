import getCatIdFromUrl from "./getCatIdFromUrl";

// Convert a brand category URL into a Demandware content-link function.
// Returns the original URL when:
//   - the input isn't an http(s) URL
//   - the path isn't in catUrlMapper for the brand
// All query parameters are passed through as comma-separated key/value
// args, preserving the order they appear in the URL.
export default function urlToContentLink(url, brand) {
  if (!url || typeof url !== "string") return url;
  if (!/^https?:\/\//i.test(url)) return url;

  const catId = getCatIdFromUrl(url, brand);
  if (!catId) return url;

  let search = "";
  try {
    search = new URL(url).search;
  } catch {
    const qIdx = url.indexOf("?");
    if (qIdx >= 0) search = url.slice(qIdx);
  }

  const args = [`'Search-Show'`, `'cgid'`, `'${catId}'`];
  for (const [key, value] of new URLSearchParams(search)) {
    args.push(`'${key}'`, `'${value}'`);
  }

  return `$url(${args.join(", ")})$`;
}
