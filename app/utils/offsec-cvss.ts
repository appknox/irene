import type {
  GoalTechnique,
  PentestFinding,
  PentestFindingCvss,
} from 'irene/models/offsec-scan';

export type CvssBand = 'critical' | 'high' | 'medium' | 'low';

type CvssFields = Pick<GoalTechnique, 'cvss' | 'reproduced' | 'poc_reason'>;

/** Most severe first. */
export const CVSS_BANDS: CvssBand[] = ['critical', 'high', 'medium', 'low'];

export function cvssScore(finding: PentestFinding): number | null {
  const score = finding.audit?.cvss?.score;

  return typeof score === 'number' ? score : null;
}

/** "Critical" → critical; anything else → none. */
export function cvssBand(rating?: string | null): CvssBand | 'none' {
  const band = (rating ?? '').toLowerCase() as CvssBand;

  return CVSS_BANDS.includes(band) ? band : 'none';
}

function highestCvss(
  ratings: (PentestFindingCvss | null | undefined)[]
): PentestFindingCvss | undefined {
  return ratings.reduce<PentestFindingCvss | undefined>(
    (best, rating) =>
      typeof rating?.score === 'number' && rating.score > (best?.score ?? -1)
        ? rating
        : best,
    undefined
  );
}

/** True when any proof of concept reproduced it, false when every one tried failed. */
function reproducedOf(flags: (boolean | undefined)[]): boolean | undefined {
  const tried = flags.filter((flag) => typeof flag === 'boolean');

  return tried.length ? tried.some(Boolean) : undefined;
}

/** What a technique card shows of the findings behind it. */
export function cvssFields(findings: PentestFinding[]): CvssFields {
  return {
    cvss: highestCvss(findings.map((f) => f.audit?.cvss)),
    reproduced: reproducedOf(findings.map((f) => f.reproduced)),
    poc_reason: findings.length === 1 ? findings[0]?.poc_reason : undefined,
  };
}

/** The same, for one card standing for several techniques of a kind. */
export function mergedCvssFields(techniques: GoalTechnique[]): CvssFields {
  return {
    cvss: highestCvss(techniques.map((t) => t.cvss)),
    reproduced: reproducedOf(techniques.map((t) => t.reproduced)),
    poc_reason: techniques.length === 1 ? techniques[0]?.poc_reason : undefined,
  };
}
