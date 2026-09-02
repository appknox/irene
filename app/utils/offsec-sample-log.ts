/**
 * A representative offensive-security agent transcript, used in two places:
 *
 *  - Mirage serves it as the persisted log blob in tests (see
 *    `mirage/config.js` → `/offsec/scans/:id/log`).
 *  - The scan-results component falls back to it in the `development`
 *    environment when the real log endpoint is unavailable, so the run view
 *    still shows realistic content while the backend log is being wired up.
 *    It is never used in staging or production — see `loadLog` in
 *    `offensive-security/scan-results/index.ts`.
 *
 * The scan-results log pane tones lines by shape (see `agent-log/index.ts`):
 * `$ ` commands render as accent, `error/failed` as error, `done./✓/success`
 * as success, and `[timestamp]` / indented lines as dim. The sample exercises
 * each so the pane looks like a real run.
 */
export const OFFSEC_SAMPLE_LOG_LINES: string[] = [
  '[00:00:01] agent booting — target com.appknox.vulnerable.banking',
  '[00:00:01] device emulator-5554 online (Android 13, arm64)',
  '[00:00:02] objective: bypass anti-tampering controls and report what fell',
  '',
  '$ frida-ps -U | grep vulnerable.banking',
  '  8421  com.appknox.vulnerable.banking',
  '[00:00:04] attaching instrumentation to pid 8421',
  '✓ gadget injected, 6 native modules mapped',
  '',
  '── root_detection ──────────────────────────────────────────',
  '$ hook RootBeer.isRooted()',
  '[00:00:07] intercepted 3 checks: su binary, test-keys, magisk path',
  '[00:00:07] returning false from all probes',
  '✓ root detection bypassed — app continued past the guard',
  '',
  '── ssl_pinning ─────────────────────────────────────────────',
  '$ hook okhttp3.CertificatePinner.check()',
  '[00:00:11] proxy set to 127.0.0.1:8080, replaying login flow',
  '[00:00:12] pinned chain rejected, unpinning TrustManager',
  '✓ ssl pinning bypassed — captured POST /api/v1/auth in cleartext',
  '',
  '── debugger_detection ──────────────────────────────────────',
  '$ hook Debug.isDebuggerConnected()',
  '[00:00:15] anti-debug thread spotted, patching return to 0',
  '✓ debugger detection bypassed — jdwp session stayed alive',
  '',
  '── code_obfuscation ────────────────────────────────────────',
  '$ analyze classes.dex — string + control-flow entropy',
  '[00:00:19] identifier renaming and string encryption present',
  'error: symbol recovery failed, class map is non-trivial',
  '[00:00:20] control-flow resisted static reconstruction',
  '✗ code obfuscation resisted — no usable deobfuscated output',
  '',
  '[00:00:21] 4 attacks launched · 3 exploited · 1 defended',
  'done. overall resilience 18/100 (weak)',
];

export const OFFSEC_FAILED_LOG_LINES: string[] = [
  '✗ attack run failed — execution terminated with errors',
];

/** The persisted log is served/handled as a single blob; callers split on \n. */
export const OFFSEC_SAMPLE_LOG = OFFSEC_SAMPLE_LOG_LINES.join('\n');
export const OFFSEC_FAILED_LOG = OFFSEC_FAILED_LOG_LINES.join('\n');
