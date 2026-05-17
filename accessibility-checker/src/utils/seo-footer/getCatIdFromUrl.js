import catUrlMapper from "@/data/templates/catUrlMapper.json";

// catUrlMapper is keyed { brand: { normalizedPath: catId } } — paths are
// already lowercased with leading/trailing slashes stripped, matching the
// normalization here.
function normalizePath(path) {
  if (!path) return "";
  return path.toLowerCase().replace(/^\/+|\/+$/g, "");
}

export default function getCatIdFromUrl(url, brand) {
  if (!url) return null;
  const brandMap = catUrlMapper[brand?.toLowerCase()];
  if (!brandMap) return null;

  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = url;
  }

  return brandMap[normalizePath(pathname)] ?? null;
}
