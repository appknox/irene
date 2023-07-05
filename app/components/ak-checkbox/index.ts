import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

export interface AkCheckboxSignature {
  Element: HTMLInputElement;
  Args: {
    id?: string;
    indeterminate?: boolean;
    checked?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    onClick?: (event: MouseEvent) => void;
    onChange?: (event: Event, checked: boolean) => void;
  };
}

export default class AkCheckboxComponent extends Component<AkCheckboxSignature> {
  get id() {
    return this.args.id || `ak-checkbox-${guidFor(this)}`;
  }

  @action
  onClick(event: MouseEvent) {
    if (this.args.readonly) {
      event.preventDefault();

      return false;
    }

    if (this.args.onClick) {
      this.args.onClick(event);
    }
  }

  @action
  onChange(event: Event) {
    if (this.args.onChange) {
      this.args.onChange(event, (event.target as HTMLInputElement).checked);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkCheckbox: typeof AkCheckboxComponent;
  }
}
