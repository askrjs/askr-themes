function normalizePathname(pathname: string): string {
  return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
}

function getWindowLocation(): Location | null {
  return typeof window === "undefined" ? null : window.location;
}

export function assertSafeNavigationHref(href: string): void {
  const trimmed = href.trim();
  if (!trimmed || trimmed !== href)
    throw new TypeError("Navigation href must be a non-empty canonical URL.");
  const scheme = /^([a-z][a-z\d+.-]*):/iu.exec(trimmed)?.[1]?.toLowerCase();
  if (scheme && !["http", "https", "mailto", "tel"].includes(scheme))
    throw new TypeError(`Navigation URL scheme is not allowed: ${scheme}`);
  if ([...trimmed].some((character) => character.charCodeAt(0) <= 31))
    throw new TypeError("Navigation href must not contain control characters.");
}

export function resolvePathname(href: string): string | null {
  if (href.startsWith("#")) {
    return null;
  }

  const location = getWindowLocation();

  if (href.startsWith("/") && !href.startsWith("//")) {
    const queryIndex = href.indexOf("?");
    const hashIndex = href.indexOf("#");
    let pathEnd = href.length;

    if (queryIndex !== -1) {
      pathEnd = Math.min(pathEnd, queryIndex);
    }

    if (hashIndex !== -1) {
      pathEnd = Math.min(pathEnd, hashIndex);
    }

    const pathname = normalizePathname(href.slice(0, pathEnd));

    if (location && hashIndex !== -1) {
      const searchEnd = hashIndex === -1 ? href.length : hashIndex;
      const search = queryIndex === -1 ? "" : href.slice(queryIndex, searchEnd);
      const locationPathname = normalizePathname(location.pathname || "/");

      if (pathname === locationPathname && search === location.search) {
        return null;
      }
    }

    return pathname;
  }

  const baseHref = location?.href ?? "http://localhost/";
  const baseOrigin = location?.origin ?? "http://localhost";

  try {
    const target = new URL(href, baseHref);

    if (target.origin !== baseOrigin) {
      return null;
    }

    if (
      location &&
      target.hash &&
      normalizePathname(target.pathname) === normalizePathname(location.pathname || "/") &&
      target.search === location.search
    ) {
      return null;
    }

    return normalizePathname(target.pathname);
  } catch {
    return null;
  }
}
