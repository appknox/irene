import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { KnoxIqStatusCardState } from '../status-card/index';

interface KnoxIqStatusChipSignature {
  Args: {
    state: KnoxIqStatusCardState;
  };
}

export default class KnoxIqStatusChipComponent extends Component<KnoxIqStatusChipSignature> {
  @service declare intl: IntlService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::StatusChip': typeof KnoxIqStatusChipComponent;
  }
}
