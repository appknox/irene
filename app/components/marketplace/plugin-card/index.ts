import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';

interface MarketplacePluginCardSignature {
  Args: {
    data: {
      published: boolean;
      link: string;
      title: string;
      description: string;
      instructions: ReturnType<typeof htmlSafe> | string;
      logo: string;
    };
  };
}

export default class MarketplacePluginCardComponent extends Component<MarketplacePluginCardSignature> {
  @tracked showInstructionsModal = false;

  @action
  openInstructionsModal() {
    this.showInstructionsModal = true;
  }

  @action
  closeInstructionsModal() {
    this.showInstructionsModal = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Marketplace::PluginCard': typeof MarketplacePluginCardComponent;
  }
}
