import Component from '@glimmer/component';

export default class MarketplaceComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Marketplace: typeof MarketplaceComponent;
  }
}
