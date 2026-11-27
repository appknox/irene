import Component from '@glimmer/component';

export interface SecurityManualScanDetailsTextAreaSignature {
  Element: HTMLElement;
  Args: {
    label: string;
    value: string;
    placeholder?: string;
    helperText?: string;
    rows?: number;
    maxLength?: number;
    monospace?: boolean;
  };
}

export default class SecurityManualScanDetailsTextAreaComponent extends Component<SecurityManualScanDetailsTextAreaSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::ManualScanDetails::TextArea': typeof SecurityManualScanDetailsTextAreaComponent;
  }
}
