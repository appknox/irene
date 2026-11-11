import type { Request } from 'irene/models/capturedapi';
import type { VulnerableApiFinding } from 'irene/utils/parse-vulnerable-api-finding';

const DEFAULT_PORTS: Record<string, string> = { http: '80', https: '443' };

function portOf(scheme: string, port: string) {
  return port || DEFAULT_PORTS[scheme] || '';
}

/**
 * Whether a vulnerable API finding was raised against a scanned endpoint.
 * Compares method (when the finding has one), scheme, host, port and path;
 * query strings are ignored since the scanner adds its own payloads there.
 */
export default function matchesApiScanRequest(
  finding: VulnerableApiFinding,
  request: Request
): boolean {
  const findingMethod = finding.request?.method?.trim().toUpperCase();

  if (findingMethod && findingMethod !== request.method.toUpperCase()) {
    return false;
  }

  let url: URL;

  try {
    url = new URL((finding.request?.url || finding.url).trim());
  } catch {
    return false;
  }

  const scheme = url.protocol.replace(':', '');
  const endpointScheme = request.scheme.toLowerCase();

  return (
    scheme === endpointScheme &&
    url.hostname.toLowerCase() === request.host.toLowerCase() &&
    portOf(scheme, url.port) === portOf(endpointScheme, String(request.port)) &&
    url.pathname === (request.path.split('?')[0] || '/')
  );
}
