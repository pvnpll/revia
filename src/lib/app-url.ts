const DEFAULT_PRODUCTION_URL = "https://revialearn.vercel.app";

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const withProtocol = vercel.startsWith("http") ? vercel : `https://${vercel}`;
    return withProtocol.replace(/\/$/, "");
  }

  return DEFAULT_PRODUCTION_URL;
}

export function getPublicAppUrl(fallbackOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (fallbackOrigin) {
    return fallbackOrigin.replace(/\/$/, "");
  }

  return DEFAULT_PRODUCTION_URL;
}

export function getAuthCallbackUrl(nextPath = "/practice"): string {
  const base = getPublicAppUrl();
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}
