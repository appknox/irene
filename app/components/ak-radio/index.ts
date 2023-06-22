import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

interface AkRadioSignature {
  Args: {
    id?: string;
    name?: string;
    checked?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    value?: string | number;
    radioCtx?: {
      name: string;
      value: string | number;
      handleChange: (event: Event) => void;
    };
    onChange?: (event: Event, checked: boolean) => void;
  };
  Element: HTMLInputElement;
}

export default class AkRadioComponent extends Component<AkRadioSignature> {
  get id() {
    return this.args.id || `ak-radio-${guidFor(this)}`;
  }

  get name() {
    // while in group name is required for onchange to properly work
    if (this.args.radioCtx) {
      return this.args.radioCtx.name;
    }

    return this.args.name || '';
  }

  get checked() {
    if (!this.isEmpty(this.args.checked)) {
      return this.args.checked;
    }

    return (
      !this.isEmpty(this.args.value) &&
      this.areEqualValues(this.args.value, this.args.radioCtx?.value)
    );
  }

  get isUncontrolled() {
    return this.isEmpty(this.args.checked);
  }

  isEmpty(value: unknown) {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && !value.trim())
    );
  }

  areEqualValues(a: unknown, b: unknown) {
    if (typeof b === 'object' && b !== null) {
      return a === b;
    }

    // The value could be a number, the DOM will stringify it anyway.
    return String(a) === String(b);
  }

  @action
  onChange(event: Event) {
    this.args.radioCtx?.handleChange(event);

    if (this.args.onChange) {
      this.args.onChange(event, (event.target as HTMLInputElement).checked);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkRadio: typeof AkRadioComponent;
  }
}
