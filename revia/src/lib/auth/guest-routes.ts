export function isAuthRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth/")
  );
}

/** Routes guests can use without signing in. */
export function isGuestRoute(pathname: string): boolean {
  if (pathname === "/explore") return true;
  if (pathname === "/practice") return true;
  if (/^\/decks\/[^/]+$/.test(pathname)) return true;
  return false;
}

export function requiresAuth(pathname: string): boolean {
  if (pathname === "/") return false;
  if (isAuthRoute(pathname)) return false;
  if (isGuestRoute(pathname)) return false;
  return true;
}
