import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

interface AkRadioGroupSignature {
  Args: {
    name?: string;
    groupDirection?: string;
    value?: string;
    onChange?: (event: Event, value: string) => void;
  };
  Element: HTMLElement;
  Blocks: {
    default: [
      { value: string; handleChange: (event: Event) => void; name: string },
    ];
  };
}

export default class AkRadioGroupComponent extends Component<AkRadioGroupSignature> {
  @tracked value = '';

  get name() {
    return this.args.name || `ak-radio-${guidFor(this)}`;
  }

  get groupDirection() {
    return this.args.groupDirection || 'column';
  }

  get finalValue() {
    return this.isEmpty(this.args.value)
      ? this.value
      : (this.args.value as string);
  }

  isEmpty(value: unknown) {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && !value.trim())
    );
  }

  @action
  handleChange(event: Event) {
    this.value = (event.target as HTMLInputElement).value;

    if (this.args.onChange) {
      this.args.onChange(event, this.value);
    }
  }
}
declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkRadio::Group': typeof AkRadioGroupComponent;
  }
}
