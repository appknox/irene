import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

export interface ProductCardDetails {
  title: string;
  description: string;
  linkText?: string;
  route: string;
  isBeta?: boolean;
  openInNewTab?: boolean;

  coverBackgroundImage:
    | 'ak-svg/storeknox-bg-img'
    | 'ak-svg/appknox-bg-img'
    | 'ak-svg/security-bg-img'
    | 'ak-svg/report-bg-img';

  indicatorSvg:
    | 'ak-svg/sm-indicator'
    | 'ak-svg/vapt-indicator'
    | 'ak-svg/security-indicator'
    | 'ak-svg/report-indicator';
}

export interface ProductCardComponentSignature {
  Element: HTMLElement;
  Args: ProductCardDetails;
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
