export const OFFSEC_FAILED_LOG_LINES: string[] = [
  '[00:00:01] agent booting — target com.appknox.vulnerable.banking',
  '[00:00:01] device emulator-5554 online (Android 13, arm64)',
  'error: failed to start instrumentation agent',
  'scan aborted: target process terminated unexpectedly',
];

/** The persisted log is served/handled as a single blob; callers split on \n. */
export const OFFSEC_FAILED_LOG = OFFSEC_FAILED_LOG_LINES.join('\n');
