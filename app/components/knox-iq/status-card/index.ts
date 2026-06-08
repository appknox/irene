import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
  @tracked isRunning = false;

  get showStatusChip() {
    const { state } = this.args;

    return state === 'completed' || state === 'running';
  }

  //TODO: Remove this once we have a better way to handle from backend in Phase 2
  @action
  resetIsRunning() {
    this.isRunning = false;
  }

  @action
  handleRunKnoxiqClick() {
    this.isRunning = true;
    this.args.onRunKnoxiq?.();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::StatusCard': typeof KnoxIqStatusCardComponent;
  }
}
