import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkChipColor } from 'irene/components/ak-chip';

export interface ProductCardDetails {
  title: string;
  description: string;
  linkText?: string;
  link2Text?: string;
  route?: string;
  route2?: string;
  chipText?: string;
  chipColor?: string;
  openInNewTab?: boolean;
  isGreyscale?: boolean;
  linkDisabled?: boolean;

  coverBackgroundImage:
    | 'ak-svg/storeknox-bg-img'
    | 'ak-svg/appknox-bg-img'
    | 'ak-svg/security-bg-img';

  indicatorSvg:
    | 'ak-svg/sm-indicator'
    | 'ak-svg/vapt-indicator'
    | 'ak-svg/security-indicator';
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

  get chipText() {
    return this.args.chipText?.toUpperCase();
  }

  get chipColor() {
    return this.args.chipColor as AkChipColor;
  }

  get isTrialVersionChip() {
    if (this.args.chipColor === 'purple') {
      return true;
    }

    return false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'HomePage::ProductCard': typeof ProductCardComponent;
  }
}
