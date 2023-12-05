import Component from '@glimmer/component';

export interface MarketplaceCardContentSignature {
  Args: {
    title: string;
    logo: string;
    text: string;
  };
}

export default class MarketplaceCardContentComponent extends Component<MarketplaceCardContentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Marketplace::CardContent': typeof MarketplaceCardContentComponent;
    'marketplace/card-content': typeof MarketplaceCardContentComponent;
  }
}
