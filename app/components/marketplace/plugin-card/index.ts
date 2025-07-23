import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import type IntlService from 'ember-intl/services/intl';

interface MarketplacePluginCardSignature {
  Args: {
    data: {
      published: boolean;
      link: string;
      title: string;
      description: string;
      instructions: ReturnType<typeof htmlSafe> | string;
      logo: string;
      modalHeading?: string;
    };
  };
}

export default class MarketplacePluginCardComponent extends Component<MarketplacePluginCardSignature> {
  @service declare intl: IntlService;

  @tracked showInstructionsModal = false;

  get modalHeading() {
    return (
      this.args.data.modalHeading ||
      this.intl.t('integrateAppknoxToCICDPipeline')
    );
  }

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
