import Component from '@glimmer/component';

import { cvssBand } from 'irene/utils/offsec-cvss';
import type { PentestFindingCvss } from 'irene/models/offsec-scan';

export interface GoalVerdictViewCvssSignature {
  Args: {
    cvss?: PentestFindingCvss | null;
    reproduced?: boolean;
    pocReason?: string;
    /** Renders the score and proof-of-concept fields instead of the chips. */
    detail?: boolean;
  };
}

export default class GoalVerdictViewCvssComponent extends Component<GoalVerdictViewCvssSignature> {
  get hasScore(): boolean {
    return typeof this.args.cvss?.score === 'number';
  }

  get band(): string {
    return cvssBand(this.args.cvss?.rating);
  }

  get label(): string {
    const { rating, score } = this.args.cvss ?? {};
    const value = typeof score === 'number' ? score.toFixed(1) : '';

    return rating ? `${rating} ${value}` : value;
  }

  get isNotReproduced(): boolean {
    return this.args.reproduced === false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::GoalVerdictView::Cvss': typeof GoalVerdictViewCvssComponent;
  }
}
