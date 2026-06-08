import Component from '@glimmer/component';

import type { KnoxIqStatusCardState } from '../status-card/index';

interface KnoxIqStatusChipSignature {
  Args: {
    state: KnoxIqStatusCardState;
  };
}

export default class KnoxIqStatusChipComponent extends Component<KnoxIqStatusChipSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::StatusChip': typeof KnoxIqStatusChipComponent;
  }
}
