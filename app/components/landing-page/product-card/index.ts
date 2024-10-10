import Component from '@glimmer/component';

export interface ProductCardComponentSignature {
  Element: HTMLElement;
  Args: {
    name: string;
    description: string;
    linkText: string;
    route: string;
  };
  Blocks: {
    default: [];
  };
}

export default class ProductCardComponent extends Component<ProductCardComponentSignature> {
  get route() {
    return this.args.route;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'LandingPage::ProductCard': typeof ProductCardComponent;
  }
}
