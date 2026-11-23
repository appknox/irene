import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import {
  goalPathName,
  readableAgentText,
} from 'irene/utils/offsec-goal-verdict';
import type { GoalPath, PentestObservation } from 'irene/models/offsec-scan';

export interface GoalVerdictViewAttemptsSignature {
  Args: {
    /** The paths a technique was tried on that never reached the goal. */
    paths?: GoalPath[];
    observations?: PentestObservation[];
    /** Leaves out the "Other attempts" label when the caller titles the list itself. */
    hideLabel?: boolean;
  };
}

export default class GoalVerdictViewAttemptsComponent extends Component<GoalVerdictViewAttemptsSignature> {
  @service declare intl: IntlService;

  /** "No result", "Abandoned", "Still running"; a status with no label of its own shows as sent. */
  statusLabel = (status?: string): string => {
    const key = `offensiveSecurity.goalView.attemptStatus.${status}`;

    return status && this.intl.exists(key) ? this.intl.t(key) : (status ?? '');
  };

  pathName = (path: GoalPath): string => goalPathName(path);

  text = (raw?: string): string => readableAgentText(raw);
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::GoalVerdictView::Attempts': typeof GoalVerdictViewAttemptsComponent;
  }
}
