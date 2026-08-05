import Component from '@glimmer/component';
import type { SignalData, ScoreLevel } from '../findings-signal-row';

export interface FindingsGroupData {
  title: string;
  description: string;
  badge: string;
  badgeLevel: ScoreLevel;
  signals: SignalData[];
}

export interface StoreknoxFakeAppsFindingsGroupSignature {
  Element: HTMLElement;
  Args: {
    groupData: FindingsGroupData;
    onSignalClick: (signal: SignalData, sectionTitle: string) => void;
    isIgnored?: boolean;
  };
}

export default class StoreknoxFakeAppsFindingsGroupComponent extends Component<StoreknoxFakeAppsFindingsGroupSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FindingsGroup': typeof StoreknoxFakeAppsFindingsGroupComponent;
  }
}
