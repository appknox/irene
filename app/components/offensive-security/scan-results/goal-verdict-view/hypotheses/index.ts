import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { humanize, readableAgentText } from 'irene/utils/offsec-goal-verdict';
import type {
  PentestHypothesis,
  PentestObservation,
} from 'irene/models/offsec-scan';

export interface GoalVerdictViewHypothesesSignature {
  Args: {
    hypotheses?: PentestHypothesis[];
    /** Every observation the goal reported; a hypothesis' evidence is looked up here. */
    observations?: PentestObservation[];
  };
}

// what the run bore out first, then what is still open, then what it ruled out
const STATUS_RANK: Record<string, number> = {
  confirmed: 0,
  refuted: 2,
};

export default class GoalVerdictViewHypothesesComponent extends Component<GoalVerdictViewHypothesesSignature> {
  @service declare intl: IntlService;

  get rows(): PentestHypothesis[] {
    return [...(this.args.hypotheses ?? [])].sort(
      (a, b) =>
        (STATUS_RANK[a.status ?? ''] ?? 1) - (STATUS_RANK[b.status ?? ''] ?? 1)
    );
  }

  get confirmedCount(): number {
    return this.rows.filter((h) => h.status === 'confirmed').length;
  }

  get refutedCount(): number {
    return this.rows.filter((h) => h.status === 'refuted').length;
  }

  /** confirmed, refuted or open: the tone of the status chip. */
  tone = (status?: string): string =>
    status === 'confirmed' || status === 'refuted' ? status : 'open';

  statusLabel = (status?: string): string =>
    this.label('hypothesisStatus', this.tone(status));

  scopeLabel = (scope?: string): string => this.label('hypothesisScope', scope);

  text = (raw?: string): string => readableAgentText(raw);

  label(group: string, value?: string): string {
    const key = `offensiveSecurity.goalView.${group}.${value}`;

    return value && this.intl.exists(key) ? this.intl.t(key) : humanize(value);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::GoalVerdictView::Hypotheses': typeof GoalVerdictViewHypothesesComponent;
  }
}
