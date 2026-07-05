import Component from '@glimmer/component';
import type StoreReleaseScanModel from 'irene/models/store-release-scan';

interface ScanCardSignature {
  Args: {
    scan: StoreReleaseScanModel;
    onCardClick?: (scanId: string) => void;
  };
}

export default class ScanCardComponent extends Component<ScanCardSignature> {
  // AppPlatformIcon expects 'android' | 'apple' (lowercase)
  get platformKey(): 'android' | 'apple' | null {
    const p = this.args.scan.platform;
    if (p === 'ANDROID') return 'android';
    if (p === 'IOS') return 'apple';
    return null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanCard': typeof ScanCardComponent;
  }
}
