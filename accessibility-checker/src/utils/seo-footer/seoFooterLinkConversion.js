import urlToContentLink from "./urlToContentLink";

export function getBrandFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    if (hostname.includes("brownthomas.com")) return "bt";
    if (hostname.includes("arnotts.ie")) return "arn";

    return null;
  } catch {
    return null;
  }
}

export function getFallbackCatIdFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/").filter(Boolean);

    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

export function isConvertibleBrandUrl(url) {
  return Boolean(getBrandFromUrl(url));
}

export function suggestContentLinkFromUrl(url) {
  const brand = getBrandFromUrl(url);

  if (!brand) {
    return {
      canConvert: false,
      originalUrl: url,
      suggestedHref: url,
      source: "external",
    };
  }

  const mappedHref = urlToContentLink(url, brand);

  if (mappedHref && mappedHref !== url) {
    return {
      canConvert: true,
      originalUrl: url,
      suggestedHref: mappedHref,
      source: "mapper",
    };
  }

  const fallbackCatId = getFallbackCatIdFromUrl(url);

  if (!fallbackCatId) {
    return {
      canConvert: false,
      originalUrl: url,
      suggestedHref: url,
      source: "none",
    };
  }

  return {
    canConvert: true,
    originalUrl: url,
    suggestedHref: `$url('Search-Show', 'cgid', '${fallbackCatId}')$`,
    source: "fallback",
  };
}