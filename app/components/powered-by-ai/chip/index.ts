import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { PoweredByAiDrawerInfo } from '../drawer';

interface PoweredByAiChipSignature {
  Element: HTMLElement;
  Args: {
    clickable: boolean;
    drawerInfo?: PoweredByAiDrawerInfo[];
  };
}

export default class PoweredByAiChipComponent extends Component<PoweredByAiChipSignature> {
  @tracked aiDrawerOpen = false;

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
