import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

export interface ProductCardComponentSignature {
  Element: HTMLElement;
  Args: {
    name: string;
    description: string;
    linkText: string;
    route: string;
    coverBackgroundImage: 'ak-svg/storeknox-bg-img' | 'ak-svg/appknox-bg-img';
<<<<<<< HEAD
    indicatorSvg: 'ak-svg/sm-indicator' | 'ak-svg/vapt-indicator';
=======
    indicatorSvg: 'ak-svg/sm-indicator' | 'ak-svg/vp-indicator';
>>>>>>> 6de9b12ec (new main product landing page and navs)
  };
  Blocks: {
    default: [];
  };
}

export default class ProductCardComponent extends Component<ProductCardComponentSignature> {
  @service declare intl: IntlService;

  get route() {
    return this.args.route;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'HomePage::ProductCard': typeof ProductCardComponent;
  }
}
