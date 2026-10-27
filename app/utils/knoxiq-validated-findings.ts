import type {
  SecurityValidatedFindingExploitability,
  SecurityValidatedFindingPoc,
  SecurityValidatedFindingRemediation,
  SecurityValidatedFindingValidation,
  SecurityValidatedFindingVerificationStep,
} from 'irene/models/security/validated-finding';

// `body` holds tiptap html. `id` is client-only, so a reorder moves the editor.
export interface SecurityValidatedFindingStep {
  heading: string;
  body: string;
  command?: string;
  codeExample?: string;
  id?: number;
}

// The flat shape the finding editor binds to.
export interface SecurityValidatedFindingContent {
  // The dashboard labels these two together as Source: the type above the
  // snippet. They are `title` and `description` on the API.
  sourceType: string;
  sourceSnippet: string;
  confidence: number;
  summary: string;
  evidence: string[];
  reasoning: string;
  remediationSteps: SecurityValidatedFindingStep[];
  stepsToReproduce: SecurityValidatedFindingStep[];
  exploitabilityLikelihood: number;
  exploitabilityAnalysis: string;
  exploitabilityScore: number | null;
  exploitabilitySignals: Record<string, boolean | 'unknown'>;
  exploitabilityEvidence: string[];
  attackScenario: string[];
  remediationSummary: string;
  pocTitle: string;
  expectedEvidence: string[];
  developerPrompt: string;
}

// The flat write-only body the API accepts.
export interface SecurityValidatedFindingPayload {
  source_type: string;
  source_snippet: string;
  confidence: number;
  summary: string;
  evidence: string[];
  reasoning: string;
  remediation_steps: SecurityValidatedFindingStep[];
  code_examples: string[];
  steps_to_reproduce: SecurityValidatedFindingStep[];
  exploitability_likelihood: number;
  exploitability_analysis: string;
  exploitability_score: number | null;
  exploitability_signals: Record<string, boolean | 'unknown'>;
  exploitability_evidence: string[];
  attack_scenario: string[];
  remediation_summary: string;
  poc_title: string;
  expected_evidence: string[];
  developer_prompt: string;
}

// Anything carrying the nested blobs — in practice, the record.
export interface SecurityValidatedFindingContentSource {
  title?: string | null;
  description?: string | null;
  validation?: Partial<SecurityValidatedFindingValidation> | null;
  remediation?: Partial<SecurityValidatedFindingRemediation> | null;
  poc?: Partial<SecurityValidatedFindingPoc> | null;
  exploitability?: Partial<SecurityValidatedFindingExploitability> | null;
  developerPrompt?: string | null;
}

export interface SecurityValidatedFindingValidationEdit {
  confidence?: number;
  summary?: string;
  evidenceHtml?: string;
  reasoning?: string;
}

export interface SecurityValidatedFindingExploitabilityEdit {
  likelihood?: number;
  analysis?: string;
  score?: number | null;
  signals?: Record<string, boolean | 'unknown'>;
  analysisEvidence?: string[];
  attackScenario?: string[];
}

export const UNKNOWN_SCALE_VALUE = -1;

// Mirrors `_CONFIDENCE_LABELS` in `mycroft/knoxiq/serializers.py`.
export const CONFIDENCE_LABELS: Record<number, string> = {
  3: 'HIGH',
  2: 'MEDIUM',
  1: 'LOW',
  [UNKNOWN_SCALE_VALUE]: 'UNKNOWN',
};

// Mirrors `_EXPLOITABILITY_LIKELIHOOD_LABELS` in the same module.
export const EXPLOITABILITY_LIKELIHOOD_LABELS: Record<number, string> = {
  3: 'High',
  2: 'Medium',
  1: 'Low',
  [UNKNOWN_SCALE_VALUE]: 'Unknown',
};

export const CONFIDENCE_VALUES = [3, 2, 1] as const;

// Unknown is offered here but not for confidence: a finding may genuinely
// have no likelihood to give, while confidence is required to save.
export const EXPLOITABILITY_LIKELIHOOD_VALUES = [
  3,
  2,
  1,
  UNKNOWN_SCALE_VALUE,
] as const;

let nextStepId = 0;

/**
 * Issues the next client-only step identity.
 *
 * @returns An id unique within this browser session.
 */
export function buildStepId() {
  return nextStepId++;
}

/**
 * Reverses a label map, matching case-insensitively.
 *
 * @param labelsByValue The value-to-label map to search.
 * @param label The label to look up.
 * @returns The matching value, or the unknown value when nothing matches.
 */
function scaleValueForLabel(
  labelsByValue: Record<number, string>,
  label?: string | null
) {
  if (!label) {
    return UNKNOWN_SCALE_VALUE;
  }

  const entry = Object.entries(labelsByValue).find(
    ([, candidate]) => candidate.toLowerCase() === label.toLowerCase()
  );

  return entry ? Number(entry[0]) : UNKNOWN_SCALE_VALUE;
}

/**
 * Converts a confidence label to the integer the API accepts.
 *
 * @param label 'HIGH', 'High' or 'high' in any casing the API emits.
 * @returns 3, 2, 1, or the unknown value.
 */
export function confidenceFromLabel(label?: string | null) {
  return scaleValueForLabel(CONFIDENCE_LABELS, label);
}

/**
 * Converts an exploitability likelihood label to the integer the API accepts.
 *
 * @param label 'High', 'HIGH' or 'high' in any casing the API emits.
 * @returns 3, 2, 1, or the unknown value.
 */
export function likelihoodFromLabel(label?: string | null) {
  return scaleValueForLabel(EXPLOITABILITY_LIKELIHOOD_LABELS, label);
}

/**
 * Reads remediation steps in either stored shape: plain strings from the AI,
 * objects once a human has saved the panel.
 *
 * @param storedSteps The stored steps, in either shape.
 * @returns Editor steps, each with an id.
 */
export function normalizeRemediationSteps(
  storedSteps?: (string | SecurityValidatedFindingStep)[] | null,
  codeExamples?: string[] | null
): SecurityValidatedFindingStep[] {
  return (storedSteps ?? []).map((storedStep, position) => {
    const codeExample = codeExamples?.[position] ?? '';
    const codeIsStringOnly = typeof storedStep === 'string';

    return codeIsStringOnly
      ? { heading: '', body: storedStep, codeExample, id: buildStepId() }
      : {
          heading: storedStep?.heading ?? '',
          body: storedStep?.body ?? '',
          codeExample,
          id: storedStep?.id ?? buildStepId(),
        };
  });
}

/**
 * Reads POC steps, which the API stores as verification steps.
 *
 * @param verificationSteps The stored verification steps.
 * @returns Editor steps, each with an id.
 */
export function normalizeVerificationSteps(
  verificationSteps?: SecurityValidatedFindingVerificationStep[] | null
): SecurityValidatedFindingStep[] {
  return (verificationSteps ?? []).map((verificationStep) => ({
    heading: verificationStep?.title ?? '',
    body: verificationStep?.expected_result ?? '',
    command: verificationStep?.command ?? '',
    id: verificationStep?.id ?? buildStepId(),
  }));
}

/**
 * Renders evidence as the bullet list the editor binds to.
 *
 * @param evidenceLines The stored evidence lines.
 * @returns List html, or an empty string when there is nothing to show.
 */
export function evidenceToHtml(evidenceLines?: string[] | null) {
  const filledLines = (evidenceLines ?? []).filter(
    (line) => line.trim().length > 0
  );

  if (filledLines.length === 0) {
    return '';
  }

  // <p> matches how tiptap serializes a list item, so the first sync is a no-op.
  const listItems = filledLines
    .map((line) => `<li><p>${line}</p></li>`)
    .join('');

  return `<ul>${listItems}</ul>`;
}

/**
 * Drops a lone paragraph wrapper, keeping any inline markup inside it.
 *
 * @param itemHtml One list item's inner html.
 * @returns The item's content without its paragraph wrapper.
 */
function unwrapParagraph(itemHtml: string) {
  const wrapped = /^<p>([\s\S]*)<\/p>$/.exec(itemHtml);
  const inner = wrapped?.[1];

  return inner !== undefined && !inner.includes('<p>')
    ? inner.trim()
    : itemHtml;
}

/**
 * Reads the editor's bullet list back into the string list the API stores.
 *
 * @param editorHtml The editor's current html.
 * @returns One entry per bullet, or a single entry for unlisted prose.
 */
export function evidenceFromHtml(editorHtml: string): string[] {
  if (!editorHtml.trim()) {
    return [];
  }

  const document = new DOMParser().parseFromString(editorHtml, 'text/html');
  const listItems = Array.from(document.body.querySelectorAll('li'));

  if (listItems.length > 0) {
    return listItems
      .map((listItem) => unwrapParagraph(listItem.innerHTML.trim()))
      .filter((line) => line.length > 0);
  }

  // Prose with no list still has to reach the API as a single-entry list.
  const prose = document.body.textContent?.trim() ?? '';

  return prose ? [prose] : [];
}

/**
 * Flattens the nested blobs into the one shape the editor binds to.
 *
 * @param source The record, or anything carrying the four nested blobs.
 * @returns The flat editor content.
 */
export function toValidatedFindingContent(
  source: SecurityValidatedFindingContentSource
): SecurityValidatedFindingContent {
  const { validation, remediation, poc, exploitability } = source;

  return {
    sourceType: source.title ?? '',
    sourceSnippet: source.description ?? '',
    summary: validation?.finding_summary ?? '',
    evidence: validation?.evidence ?? [],
    reasoning: validation?.reasoning ?? '',
    confidence: confidenceFromLabel(validation?.confidence_label),
    stepsToReproduce: normalizeVerificationSteps(poc?.verification_steps),
    exploitabilityScore: exploitability?.score ?? null,
    exploitabilitySignals: exploitability?.signals ?? {},
    attackScenario: exploitability?.attack_scenario ?? [],
    remediationSummary: remediation?.remediation ?? '',
    pocTitle: poc?.poc_title ?? '',
    expectedEvidence: poc?.expected_evidence ?? [],
    developerPrompt: source.developerPrompt ?? '',

    exploitabilityAnalysis:
      exploitability?.exploitability_analysis?.summary ?? '',

    exploitabilityLikelihood: likelihoodFromLabel(
      exploitability?.exploitability_likelihood
    ),

    remediationSteps: normalizeRemediationSteps(
      remediation?.steps,
      remediation?.code_examples
    ),

    exploitabilityEvidence:
      exploitability?.exploitability_analysis?.evidence ?? [],
  };
}

/**
 * Drops the client-only identity so it never reaches the API.
 *
 * @param step The editor step to send.
 * @returns The step without its id.
 */
function withoutStepId({ heading, body }: SecurityValidatedFindingStep) {
  return { heading, body };
}

/**
 * Drops the client-only identity but keeps the command, which only
 * reproduction steps carry.
 *
 * @param step The editor step to send.
 * @returns The step without its id, carrying its command.
 */
function reproductionStepForApi({
  heading,
  body,
  command,
}: SecurityValidatedFindingStep) {
  return { heading, body, command: command ?? '' };
}

/**
 * Builds the flat write-only body from the editor's content.
 *
 * @param content The flat editor content.
 * @returns The request body the API accepts.
 */
export function toValidatedFindingPayload(
  content: SecurityValidatedFindingContent
): SecurityValidatedFindingPayload {
  return {
    source_type: content.sourceType,
    source_snippet: content.sourceSnippet,
    confidence: content.confidence,
    summary: content.summary,
    evidence: content.evidence,
    reasoning: content.reasoning,
    remediation_steps: content.remediationSteps.map(withoutStepId),
    steps_to_reproduce: content.stepsToReproduce.map(reproductionStepForApi),
    exploitability_likelihood: content.exploitabilityLikelihood,
    exploitability_analysis: content.exploitabilityAnalysis,
    exploitability_score: content.exploitabilityScore,
    exploitability_signals: content.exploitabilitySignals,
    exploitability_evidence: content.exploitabilityEvidence,
    attack_scenario: content.attackScenario,
    remediation_summary: content.remediationSummary,
    poc_title: content.pocTitle,
    expected_evidence: content.expectedEvidence,
    developer_prompt: content.developerPrompt,

    // Two parallel lists on the API; the editor keeps them as one so a
    // reorder cannot pull an example onto the wrong step.
    code_examples: content.remediationSteps.map(
      (step) => step.codeExample ?? ''
    ),
  };
}

/**
 * Applies a validation edit to the stored blob.
 *
 * @param validation The blob currently on the record.
 * @param edit The fields the editor changed.
 * @returns The replacement blob.
 */
export function buildValidation(
  validation: SecurityValidatedFindingValidation,
  edit: SecurityValidatedFindingValidationEdit
): SecurityValidatedFindingValidation {
  const updated = { ...validation };

  if (edit.confidence !== undefined) {
    updated.confidence_label =
      CONFIDENCE_LABELS[edit.confidence] ??
      (CONFIDENCE_LABELS[UNKNOWN_SCALE_VALUE] as string);
  }

  if (edit.summary !== undefined) {
    updated.finding_summary = edit.summary;
  }

  if (edit.evidenceHtml !== undefined) {
    updated.evidence = evidenceFromHtml(edit.evidenceHtml);
  }

  if (edit.reasoning !== undefined) {
    updated.reasoning = edit.reasoning;
  }

  return updated;
}

/**
 * Applies a remediation step edit to the stored blob.
 *
 * @param remediation The blob currently on the record.
 * @param editorSteps The editor's steps, in order.
 * @returns The replacement blob.
 */
export function buildRemediation(
  remediation: SecurityValidatedFindingRemediation,
  editorSteps: SecurityValidatedFindingStep[]
): SecurityValidatedFindingRemediation {
  return {
    ...remediation,
    steps: editorSteps,
    // code_examples is a list parallel to steps. Rewriting the steps without
    // it would leave the examples behind at their old positions.
    code_examples: editorSteps.map((step) => step.codeExample ?? ''),
  };
}

/**
 * Applies an edit to the remediation fields that sit beside its steps.
 *
 * @param remediation The blob currently on the record.
 * @param edit The fields the editor changed.
 * @returns The replacement blob.
 */
export function buildRemediationDetails(
  remediation: SecurityValidatedFindingRemediation,
  edit: { summary?: string; codeExamples?: string[] }
): SecurityValidatedFindingRemediation {
  const updated = { ...remediation };

  if (edit.summary !== undefined) {
    updated.remediation = edit.summary;
  }

  if (edit.codeExamples !== undefined) {
    updated.code_examples = edit.codeExamples;
  }

  return updated;
}

/**
 * Applies an edit to the poc fields that sit beside its steps.
 *
 * @param poc The blob currently on the record.
 * @param edit The fields the editor changed.
 * @returns The replacement blob.
 */
export function buildPocDetails(
  poc: SecurityValidatedFindingPoc,
  edit: { title?: string; expectedEvidence?: string[] }
): SecurityValidatedFindingPoc {
  const updated = { ...poc };

  if (edit.title !== undefined) {
    updated.poc_title = edit.title;
  }

  if (edit.expectedEvidence !== undefined) {
    updated.expected_evidence = edit.expectedEvidence;
  }

  return updated;
}

/**
 * Applies a reproduction step edit to the stored blob, numbering by position.
 *
 * @param poc The blob currently on the record.
 * @param editorSteps The editor's steps, in order.
 * @returns The replacement blob.
 */
export function buildPoc(
  poc: SecurityValidatedFindingPoc,
  editorSteps: SecurityValidatedFindingStep[]
): SecurityValidatedFindingPoc {
  return {
    ...poc,
    verification_steps: editorSteps.map((editorStep, position) => ({
      step_number: position + 1,
      id: editorStep.id,
      title: editorStep.heading,
      command: editorStep.command ?? '',
      expected_result: editorStep.body,
    })),
  };
}

/**
 * Applies an exploitability edit to the stored blob.
 *
 * @param exploitability The blob currently on the record.
 * @param edit The fields the editor changed.
 * @returns The replacement blob.
 */
export function buildExploitability(
  exploitability: SecurityValidatedFindingExploitability,
  edit: SecurityValidatedFindingExploitabilityEdit
): SecurityValidatedFindingExploitability {
  const updated = { ...exploitability };

  if (edit.likelihood !== undefined) {
    updated.exploitability_likelihood =
      EXPLOITABILITY_LIKELIHOOD_LABELS[edit.likelihood] ??
      (EXPLOITABILITY_LIKELIHOOD_LABELS[UNKNOWN_SCALE_VALUE] as string);
  }

  if (edit.score !== undefined) {
    updated.score = edit.score;
  }

  if (edit.signals !== undefined) {
    updated.signals = edit.signals;
  }

  if (edit.attackScenario !== undefined) {
    updated.attack_scenario = edit.attackScenario;
  }

  if (edit.analysisEvidence !== undefined) {
    updated.exploitability_analysis = {
      ...exploitability?.exploitability_analysis,
      summary: exploitability?.exploitability_analysis?.summary ?? '',
      evidence: edit.analysisEvidence,
    };
  }

  if (edit.analysis !== undefined) {
    updated.exploitability_analysis = {
      ...exploitability?.exploitability_analysis,
      summary: edit.analysis,
      evidence: exploitability?.exploitability_analysis?.evidence ?? [],
    };
  }

  return updated;
}
