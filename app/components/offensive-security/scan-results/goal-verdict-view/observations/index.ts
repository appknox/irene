import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { readableAgentText, verbName } from 'irene/utils/offsec-goal-verdict';
import type { PentestObservation } from 'irene/models/offsec-scan';

export interface GoalVerdictViewObservationsSignature {
  Args: {
    /** The ids a path recorded, in the order it recorded them. */
    ids?: number[];
    /** Every observation the goal reported; the ids are looked up here. */
    observations?: PentestObservation[];
  };
}

// a tool's output runs to megabytes; more than this is not read on the page
const OUTPUT_LIMIT = 4000;

export default class GoalVerdictViewObservationsComponent extends Component<GoalVerdictViewObservationsSignature> {
  @service declare intl: IntlService;

  /** The path's observations; an id the goal sent no observation for is left out. */
  get rows(): PentestObservation[] {
    const byId = new Map((this.args.observations ?? []).map((o) => [o.id, o]));

    return (this.args.ids ?? [])
      .map((id) => byId.get(id))
      .filter((o): o is PentestObservation => Boolean(o));
  }

  /** success, empty or refused; anything else reads as neutral. */
  outcomeTone = (outcome?: string): string => {
    const value = (outcome || '').toLowerCase();

    if (value === 'error') {
      return 'refused';
    }

    return ['success', 'empty', 'refused'].includes(value) ? value : 'neutral';
  };

  outcomeLabel = (outcome?: string): string => {
    const key = `offensiveSecurity.goalView.observationOutcome.${outcome}`;

    return outcome && this.intl.exists(key) ? this.intl.t(key) : '';
  };

  toolName = (obs: PentestObservation): string => verbName(obs.verb);

  note = (obs: PentestObservation): string => readableAgentText(obs.note);

  output = (obs: PentestObservation): string =>
    (obs.output ?? '').slice(0, OUTPUT_LIMIT);

  isOutputCut = (obs: PentestObservation): boolean =>
    (obs.output?.length ?? 0) > OUTPUT_LIMIT;

  outputLength = (obs: PentestObservation): number => obs.output?.length ?? 0;

  get outputLimit(): number {
    return OUTPUT_LIMIT;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::GoalVerdictView::Observations': typeof GoalVerdictViewObservationsComponent;
  }
}
