/**
 * Adds <link rel="preconnect"> (with a dns-prefetch fallback for browsers
 * that don't support preconnect) for each given absolute origin, so the
 * browser starts DNS/TCP/TLS negotiation for cross-origin API calls before
 * the app's own JS gets around to making its first request. Falsy or
 * relative values (e.g. ENV.host === '' for a same-origin deploy) are
 * skipped, since there's no separate origin to warm up.
 */
export default function addPreconnectHints(
  origins: Array<string | null | undefined>
): void {
  const seen = new Set<string>();

  for (const origin of origins) {
    if (!origin || !/^https?:\/\//.test(origin) || seen.has(origin)) {
      continue;
    }

    seen.add(origin);

    for (const rel of ['preconnect', 'dns-prefetch']) {
      const link = document.createElement('link');

      link.rel = rel;
      link.href = origin;

      if (rel === 'preconnect') {
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    }
  }
}
