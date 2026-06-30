import Component from '@glimmer/component';

export type ScoreLevel = 'high' | 'medium' | 'low';

export interface SignalData {
  title: string;
  result: string;
  resultLevel: ScoreLevel;
  description: string;
  numericScore: number;
}

export interface StoreknoxFakeAppsFindingsSignalRowSignature {
  Args: {
    signal: SignalData;
    onClick: () => void;
  };
}

export default class StoreknoxFakeAppsFindingsSignalRowComponent extends Component<StoreknoxFakeAppsFindingsSignalRowSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FindingsSignalRow': typeof StoreknoxFakeAppsFindingsSignalRowComponent;
  }
}
