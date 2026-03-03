import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { PoweredByAiDrawerInfo } from '../drawer';

interface PoweredByAiChipSignature {
  Element: HTMLElement;
  Args: {
    chipText?: string;
    clickable: boolean;
    drawerInfo?: PoweredByAiDrawerInfo[] | null;
  };
}

export default class PoweredByAiChipComponent extends Component<PoweredByAiChipSignature> {
  @service declare intl: IntlService;
  @tracked aiDrawerOpen = false;

  get chipText() {
    return this.args.chipText || this.intl.t('poweredByAi', { htmlSafe: true });
  }

  @action openAIDrawer() {
    this.aiDrawerOpen = true;
  }

  @action closeAiDrawer() {
    this.aiDrawerOpen = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PoweredByAi::Chip': typeof PoweredByAiChipComponent;
  }
}
