/**
 * Translation layer between the KnoxIQ finding API's two shapes.
 *
 * Reads come back nested and AI-native (`validation`, `remediation`, `poc`,
 * `exploitability`). Writes go out flat, with confidence and likelihood as
 * integers. Both directions live here so the security dashboard's finding
 * editor only ever deals with one shape.
 */

import type {
  SecurityValidatedFindingExploitability,
  SecurityValidatedFindingPoc,
  SecurityValidatedFindingRemediation,
  SecurityValidatedFindingValidation,
  SecurityValidatedFindingVerificationStep,
} from 'irene/models/security/validated-finding';

export const UNKNOWN_SCALE_VALUE = -1;

/** Mirrors `_CONFIDENCE_LABELS` in `mycroft/knoxiq/serializers.py`. */
export const CONFIDENCE_LABELS: Record<number, string> = {
  3: 'HIGH',
  2: 'MEDIUM',
  1: 'LOW',
  [UNKNOWN_SCALE_VALUE]: 'UNKNOWN',
};

/** Mirrors `_EXPLOITABILITY_LIKELIHOOD_LABELS` in the same module. */
export const EXPLOITABILITY_LIKELIHOOD_LABELS: Record<number, string> = {
  3: 'High',
  2: 'Medium',
  1: 'Low',
  [UNKNOWN_SCALE_VALUE]: 'Unknown',
};

export const CONFIDENCE_VALUES = [3, 2, 1] as const;
export const EXPLOITABILITY_LIKELIHOOD_VALUES = [3, 2, 1] as const;

/**
 * An editor step. `body` holds tiptap html rather than plain text.
 *
 * `id` is client-only and never sent to the API. The step bodies render as
 * tiptap editors, whose content is editor state rather than a bound
 * attribute, so the list has to key on something that survives a reorder —
 * keyed positionally, a drag would reuse each editor in place and leave its
 * document behind.
 */
export interface ManualFindingStep {
  heading: string;
  body: string;
  id?: number;
}

let nextStepId = 0;

/** Issues the client-only identity a newly added step is keyed on. */
export function buildStepId() {
  return nextStepId++;
}

/** The single flat shape the finding editor binds to. */
export interface ManualFindingContent {
  confidence: number;
  summary: string;
  evidence: string[];
  reasoning: string;
  remediationSteps: ManualFindingStep[];
  stepsToReproduce: ManualFindingStep[];
  exploitabilityLikelihood: number;
  exploitabilityAnalysis: string;
}

/** The flat write-only body `KnoxIQFindingSerializer` accepts. */
export interface ManualFindingPayload {
  confidence: number;
  summary: string;
  evidence: string[];
  reasoning: string;
  remediation_steps: ManualFindingStep[];
  steps_to_reproduce: ManualFindingStep[];
  exploitability_likelihood: number;
  exploitability_analysis: string;
}

function valueFromLabel(labels: Record<number, string>, label?: string | null) {
  if (!label) {
    return UNKNOWN_SCALE_VALUE;
  }

  const match = Object.entries(labels).find(
    ([, name]) => name.toLowerCase() === label.toLowerCase()
  );

  return match ? Number(match[0]) : UNKNOWN_SCALE_VALUE;
}

/** 'HIGH' | 'High' | 'high' -> 3. Anything unrecognised reads as unknown. */
export function confidenceFromLabel(label?: string | null) {
  return valueFromLabel(CONFIDENCE_LABELS, label);
}

/** 'High' | 'HIGH' | 'high' -> 3. Anything unrecognised reads as unknown. */
export function likelihoodFromLabel(label?: string | null) {
  return valueFromLabel(EXPLOITABILITY_LIKELIHOOD_LABELS, label);
}

/**
 * `remediation.steps` has two shapes: plain strings from the AI result, and
 * `{heading, body}` objects once a human has saved that panel.
 */
export function normalizeRemediationSteps(
  steps?: (string | ManualFindingStep)[] | null
): ManualFindingStep[] {
  return (steps ?? []).map((step) =>
    typeof step === 'string'
      ? { heading: '', body: step, id: buildStepId() }
      : {
          heading: step?.heading ?? '',
          body: step?.body ?? '',
          id: step?.id ?? buildStepId(),
        }
  );
}

/**
 * The backend stores reproduction steps as verification steps and drops
 * `command` on every write, so only title and expected_result round-trip.
 */
export function normalizeVerificationSteps(
  steps?: SecurityValidatedFindingVerificationStep[] | null
): ManualFindingStep[] {
  return (steps ?? []).map((step) => ({
    heading: step?.title ?? '',
    body: step?.expected_result ?? '',
    id: step?.id ?? buildStepId(),
  }));
}

/** `evidence` is a list of strings on the wire and a bullet list in the editor. */
export function evidenceToHtml(evidence?: string[] | null) {
  const items = (evidence ?? []).filter((item) => item.trim().length > 0);

  if (items.length === 0) {
    return '';
  }

  // Wrapped in <p> because that is how tiptap serializes a list item, so the
  // editor's first sync is a no-op rather than a rewrite.
  return `<ul>${items.map((item) => `<li><p>${item}</p></li>`).join('')}</ul>`;
}

/**
 * tiptap wraps each list item's content in a paragraph. The API stores plain
 * bullet strings, so a lone wrapper is dropped while inline markup is kept.
 */
function unwrapParagraph(html: string) {
  const match = /^<p>([\s\S]*)<\/p>$/.exec(html);

  return match?.[1] !== undefined && !match[1].includes('<p>')
    ? match[1].trim()
    : html;
}

export function evidenceFromHtml(html: string): string[] {
  if (!html.trim()) {
    return [];
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const items = Array.from(parsed.body.querySelectorAll('li'));

  if (items.length > 0) {
    return items
      .map((item) => unwrapParagraph(item.innerHTML.trim()))
      .filter((item) => item.length > 0);
  }

  // A reader who never used the bullet list leaves one block of prose, which
  // the API still has to receive as a single-entry list.
  const text = parsed.body.textContent?.trim() ?? '';

  return text ? [text] : [];
}

/** Editor bodies hold html; read-only views render them as text. */
export function htmlToText(html: string) {
  if (!html.includes('<')) {
    return html;
  }

  return (
    new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
  );
}

export interface KnoxiqFindingResponseContent {
  validation?: Partial<SecurityValidatedFindingValidation> | null;
  remediation?: Partial<SecurityValidatedFindingRemediation> | null;
  poc?: Partial<SecurityValidatedFindingPoc> | null;
  exploitability?: Partial<SecurityValidatedFindingExploitability> | null;
}

/** Nested API response -> the flat shape the editor binds to. */
export function fromKnoxiqFindingResponse(
  content: KnoxiqFindingResponseContent
): ManualFindingContent {
  const { validation, remediation, poc, exploitability } = content;

  return {
    confidence: confidenceFromLabel(validation?.confidence_label),
    summary: validation?.finding_summary ?? '',
    evidence: validation?.evidence ?? [],
    reasoning: validation?.reasoning ?? '',
    remediationSteps: normalizeRemediationSteps(remediation?.steps),
    stepsToReproduce: normalizeVerificationSteps(poc?.verification_steps),
    exploitabilityLikelihood: likelihoodFromLabel(
      exploitability?.exploitability_likelihood
    ),
    exploitabilityAnalysis:
      exploitability?.exploitability_analysis?.summary ?? '',
  };
}

/** The client-only identity never leaves the browser. */
function stripStepId({ heading, body }: ManualFindingStep) {
  return { heading, body };
}

/** The flat editor shape -> the flat write-only body. */
export function toKnoxiqFindingPayload(
  content: ManualFindingContent
): ManualFindingPayload {
  return {
    confidence: content.confidence,
    summary: content.summary,
    evidence: content.evidence,
    reasoning: content.reasoning,
    remediation_steps: content.remediationSteps.map(stripStepId),
    steps_to_reproduce: content.stepsToReproduce.map(stripStepId),
    exploitability_likelihood: content.exploitabilityLikelihood,
    exploitability_analysis: content.exploitabilityAnalysis,
  };
}
