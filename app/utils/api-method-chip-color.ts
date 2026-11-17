import type { AkChipColor } from 'irene/components/ak-chip';

const METHOD_CHIP_COLORS: Record<string, AkChipColor> = {
  GET: 'info',
  POST: 'success',
  PUT: 'warn',
  PATCH: 'secondary',
  DELETE: 'error',
};

/**
 * Chip color for an HTTP method, shared by the API scan screens so a
 * method looks the same everywhere. Unknown methods use the default color.
 */
export default function apiMethodChipColor(method?: string): AkChipColor {
  return METHOD_CHIP_COLORS[(method ?? '').toUpperCase()] ?? 'default';
}
