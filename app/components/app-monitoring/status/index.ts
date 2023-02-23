import Component from '@glimmer/component';
import { AkChipColor } from 'irene/components/ak-chip';
interface AppMonitoringStatusSignature {
  Element: HTMLDivElement;
  Args: {
    condition?: AkChipColor;
    label?: string;
  };
}

export default class AppMonitoringStatusComponent extends Component<AppMonitoringStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Status': typeof AppMonitoringStatusComponent;
  }
}
