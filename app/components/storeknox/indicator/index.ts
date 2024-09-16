import Component from '@glimmer/component';

export interface StoreknoxIndicatorSignature {
  Element: HTMLElement;
  Args: {
    indicatorInfo: string;
    svgComponent:
      | 'ak-svg/sm-indicator'
      | 'ak-svg/info-indicator'
      | 'ak-svg/vapt-indicator'
      | 'ak-svg/disabled-vapt-indicator';
  };
}

export default class StoreknoxIndicatorComponent extends Component<StoreknoxIndicatorSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Indicator': typeof StoreknoxIndicatorComponent;
  }
}
