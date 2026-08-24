import Model, { attr } from '@ember-data/model';

export interface OffsecFindingEvidence {
  id: number;
  evidence_id: string;
  step: number;
  source: string;
  strength: string;
  tool: string;
  ok: boolean;
  summary: string;
  content: string;
  error: string;
  metadata: Record<string, unknown>;
}

export default class OffsecFindingModel extends Model {
  @attr('string')
  declare signatureId: string;

  @attr('string')
  declare name: string;

  @attr('string')
  declare category: string;

  @attr('string')
  declare checkType: string;

  @attr('boolean')
  declare detected: boolean;

  @attr('string')
  declare outcome: string;

  @attr('number')
  declare score: number | null;

  @attr('string')
  declare band: string;

  @attr('string')
  declare rationale: string;

  @attr('number')
  declare order: number;

  @attr()
  declare detail: Record<string, unknown> | undefined;

  @attr()
  declare evidence: OffsecFindingEvidence[] | undefined;

  /** The agent got past this protection — the finding that actually matters. */
  get isExploited(): boolean {
    return this.outcome === 'bypassed';
  }

  get isResisted(): boolean {
    return this.outcome === 'resisted';
  }

  get wasAttempted(): boolean {
    return this.outcome !== 'not_attempted' && this.outcome !== '';
  }

  /**
   * How the outcome should read in the UI. Kept here rather than in a helper so the
   * table, the detail header and the tabs cannot drift apart.
   */
  get outcomeClass():
    | 'exploited'
    | 'defended'
    | 'errored'
    | 'detected'
    | 'not-applicable' {
    switch (this.outcome) {
      case 'bypassed':
        return 'exploited';
      case 'resisted':
        return 'defended';
      case 'error':
        return 'errored';
      case 'not_attempted':
        return 'detected';
      default:
        return 'not-applicable';
    }
  }

  /** Severity is only meaningful once a protection has actually been bypassed. */
  get severity(): 'critical' | 'high' | 'medium' | 'low' | 'none' {
    if (!this.isExploited) {
      return 'none';
    }

    switch ((this.band || '').toLowerCase()) {
      case 'weak':
        return 'critical';
      case 'moderate':
        return 'high';
      case 'strong':
        return 'medium';
      case 'very_strong':
        return 'low';
      default:
        return 'medium';
    }
  }

  get bandLabel(): string {
    return (this.band || '').replace(/_/g, ' ');
  }

  get evidenceList(): OffsecFindingEvidence[] {
    return this.evidence ?? [];
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'offsec-finding': OffsecFindingModel;
  }
}
