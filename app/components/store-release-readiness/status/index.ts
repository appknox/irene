import Component from '@glimmer/component';

import './index.scss';

export interface StoreReleaseReadinessStatusSignature {
  Element: HTMLElement;
  Args: {
    heading: string;
    description: string;
    svgComponent:
      | 'ak-svg/not-started-tower'
      | 'ak-svg/no-result'
      | 'ak-svg/store-release-readiness-scan-failed'
      | 'ak-svg/privacy-upload';
    /** Parent supplies surface/padding (e.g. assessment filtered-empty panel). */
    transparentBackground?: boolean;
  };
}

export default class StoreReleaseReadinessStatusComponent extends Component<StoreReleaseReadinessStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::Status': typeof StoreReleaseReadinessStatusComponent;
  }
}
