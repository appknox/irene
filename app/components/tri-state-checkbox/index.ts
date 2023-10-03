import Component from '@glimmer/component';

export interface TriStateCheckboxSignature {
  Element: HTMLDivElement;
  Args: {
    label: string;
    title: string;
    value: boolean | undefined;
    onToggle: (event: Event) => void;
    onOverrideReset: () => void;
    isToggleRunning: boolean;
    isOverridden: boolean;
  };
}

export default class TriStateCheckboxComponent extends Component<TriStateCheckboxSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    TriStateCheckbox: typeof TriStateCheckboxComponent;
  }
}
