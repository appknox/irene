import ENUMS from 'irene/enums';

/**
 * Whether a scanned endpoint has vulnerability results to show: it was
 * scanned, or a stopped scan cancelled it after leaving findings on it.
 * Shared by the scanned APIs list's count cell and its row click.
 */
export default function apiScanUrlHasResults(
  status: number,
  vulnerabilityCount: number
): boolean {
  if (status === ENUMS.API_SCAN_URL_STATUS.COMPLETED) {
    return true;
  }

  return (
    status === ENUMS.API_SCAN_URL_STATUS.CANCELLED && vulnerabilityCount > 0
  );
}
