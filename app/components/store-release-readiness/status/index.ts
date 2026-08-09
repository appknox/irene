import Component from '@glimmer/component';

export interface StoreReleaseReadinessStatusSignature {
  Element: HTMLElement;
  Args: {
    heading: string;
    description: string;
    svgComponent:
      | 'ak-svg/not-started-tower'
      | 'ak-svg/no-result'
      | 'ak-svg/store-release-readiness-scan-failed'
      | 'ak-svg/privacy-upload'
      | 'ak-svg/project-list-empty';
    transparentBackground?: boolean;
  };
}

export default class StoreReleaseReadinessStatusComponent extends Component<StoreReleaseReadinessStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::Status': typeof StoreReleaseReadinessStatusComponent;
  }
}
