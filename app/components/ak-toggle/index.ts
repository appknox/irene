import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

export interface AkToggleSignature {
  Element: HTMLSpanElement;
  Args: {
    id?: string;
    size?: string;
    checked?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    onChange?: (event: Event, checked?: boolean) => void;
    onClick?: (event: MouseEvent, checked?: boolean) => void;
  };
}

export default class AkToggleComponent extends Component<AkToggleSignature> {
  get id() {
    return this.args.id || `ak-toggle-${guidFor(this)}`;
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
    const target = event?.target as HTMLInputElement;

    if (this.args.onChange) {
      this.args.onChange(event, target.checked);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkToggle: typeof AkToggleComponent;
  }
}
