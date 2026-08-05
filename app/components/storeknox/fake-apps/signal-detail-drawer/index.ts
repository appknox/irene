import Component from '@glimmer/component';
import type { SignalData } from '../findings-signal-row';

export interface StoreknoxFakeAppsSignalDetailDrawerSignature {
  Args: {
    isOpen: boolean;
    sectionTitle: string;
    signal: SignalData | null;
    onClose: () => void;
  };
}

export default class StoreknoxFakeAppsSignalDetailDrawerComponent extends Component<StoreknoxFakeAppsSignalDetailDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::SignalDetailDrawer': typeof StoreknoxFakeAppsSignalDetailDrawerComponent;
  }
}
