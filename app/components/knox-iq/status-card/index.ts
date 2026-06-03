import Component from '@glimmer/component';
import { action } from '@ember/object';

export type KnoxIqStatusCardState =
  | 'active'
  | 'inactive'
  | 'running'
  | 'completed'
  | 'failed';

interface KnoxIqStatusCardSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
    subtitle?: string;
    state: KnoxIqStatusCardState;
    onRunKnoxiq?: () => void;
  };
}

export default class KnoxIqStatusCardComponent extends Component<KnoxIqStatusCardSignature> {
  get showStatusChip() {
    const { state } = this.args;

    return state === 'completed' || state === 'running';
  }

  @action
  handleRunKnoxiqClick() {
    this.args.onRunKnoxiq?.();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::StatusCard': typeof KnoxIqStatusCardComponent;
  }
}
