import catUrlMapper from "@/data/templates/catUrlMapper.json";

function normalizePath(path) {
  if (!path) return "";

  return path
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

export default function getCatIdFromUrl(url, brand) {
  if (!url) return null;

  const brandMap = catUrlMapper[brand?.toLowerCase()];
  if (!brandMap) return null;

  let pathname = "";
  let search = "";

  try {
    const parsedUrl = new URL(url);

    pathname = parsedUrl.pathname;
    search = parsedUrl.search;
  } catch {
    const [rawPathname, rawQuery = ""] = String(url).split("?");

    pathname = rawPathname;
    search = rawQuery ? `?${rawQuery}` : "";
  }

  const normalizedPath = normalizePath(pathname);

  const normalizedPathWithQuery = search
    ? `${normalizedPath}/${search.toLowerCase()}`
    : normalizedPath;

  const mappedWithQuery = brandMap[normalizedPathWithQuery];

  if (mappedWithQuery) {
    return mappedWithQuery;
  }

  const mappedFromPath = brandMap[normalizedPath];

  if (mappedFromPath) {
    return mappedFromPath;
  }

  const queryCatId = new URLSearchParams(search).get("cgid");

  return queryCatId || null;
}