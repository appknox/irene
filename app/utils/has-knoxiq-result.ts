import ENUMS from 'irene/enums';

interface KnoxiqTriagedAnalysis {
  exploitabilityLikelihood?: number | null;
  isKnoxiqAllFp?: boolean;
}

/**
 * Whether KnoxIQ has produced a verdict for an analysis — either an
 * exploitability score or an all-false-positive call.
 *
 * This is the rule that decides whether an analysis belongs on the KnoxIQ
 * layout or the legacy one, so the table's row links and the legacy page's
 * auto-redirect both read it from here and cannot drift apart.
 */
export default function hasKnoxiqResult(
  analysis: KnoxiqTriagedAnalysis
): boolean {
  const likelihood = analysis.exploitabilityLikelihood;

  return Boolean(
    analysis.isKnoxiqAllFp ||
      (likelihood != null &&
        likelihood !== ENUMS.KNOXIQ_EXPLOITABILITY.EXP_UNKNOWN)
  );
}
