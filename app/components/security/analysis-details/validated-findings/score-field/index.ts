import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export const SECURITY_VALIDATED_FINDING_SCORE_MIN = 0;
export const SECURITY_VALIDATED_FINDING_SCORE_MAX = 10;
export const SECURITY_VALIDATED_FINDING_SCORE_STEP = 0.1;

export interface SecurityAnalysisDetailsValidatedFindingsScoreFieldSignature {
  Args: {
    score: number | null;
    disabled?: boolean;
    onChange: (score: number) => void;
  };
}

/**
 * Score stepper for a single validated finding. The analysis AEIS score is the
 * highest of these, so it is read-only on the analysis card and edited here.
 */
export default class SecurityAnalysisDetailsValidatedFindingsScoreFieldComponent extends Component<SecurityAnalysisDetailsValidatedFindingsScoreFieldSignature> {
  // The raw text while someone is typing, which may not yet be a usable
  // number ('', '7.', '12'). Cleared on blur.
  @tracked draft: string | null = null;

  readonly scoreMin = SECURITY_VALIDATED_FINDING_SCORE_MIN;
  readonly scoreMax = SECURITY_VALIDATED_FINDING_SCORE_MAX;
  readonly scoreStepUp = SECURITY_VALIDATED_FINDING_SCORE_STEP;
  readonly scoreStepDown = -SECURITY_VALIDATED_FINDING_SCORE_STEP;

  get score() {
    return this.args.score ?? null;
  }

  get fieldValue() {
    if (this.draft !== null) {
      return this.draft;
    }

    return this.score === null ? '' : this.score.toFixed(1);
  }

  get isDecrementDisabled() {
    return Boolean(this.args.disabled) || (this.score ?? 0) <= this.scoreMin;
  }

  get isIncrementDisabled() {
    return Boolean(this.args.disabled) || (this.score ?? 0) >= this.scoreMax;
  }

  clampScore(value: number) {
    return Number(
      Math.min(this.scoreMax, Math.max(this.scoreMin, value)).toFixed(1)
    );
  }

  @action
  stepScore(delta: number) {
    this.draft = null;

    this.args.onChange(this.clampScore((this.score ?? 0) + delta));
  }

  @action
  updateScore(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = Number.parseFloat(raw);

    this.draft = raw;

    if (raw.trim() === '' || Number.isNaN(parsed)) {
      return;
    }

    this.args.onChange(this.clampScore(parsed));
  }

  @action
  commitScore() {
    this.draft = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::ScoreField': typeof SecurityAnalysisDetailsValidatedFindingsScoreFieldComponent;
  }
}
