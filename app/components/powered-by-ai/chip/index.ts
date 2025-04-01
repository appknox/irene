import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface Info {
  title: string;
  body: string;
  marginTop: string;
}

interface PoweredByAiChipSignature {
  Element: HTMLElement;
  Args: {
    clickable: boolean;
    drawerInfo?: Info[];
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
