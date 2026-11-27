import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

// Names longer than this also get a tooltip with the full name.
const LONG_NAME_LENGTH = 30;

export interface SecurityManualScanDetailsNameListSignature {
  Element: HTMLElement;
  Args: {
    label: string;
    names: string[];
    maxNames: number;
    maxLength: number;
    onChange: (names: string[]) => void;
  };
}

export default class SecurityManualScanDetailsNameListComponent extends Component<SecurityManualScanDetailsNameListSignature> {
  @tracked nameInput = '';

  get isAtLimit() {
    return this.args.names.length >= this.args.maxNames;
  }

  get isAddDisabled() {
    return this.isAtLimit || this.nameInput.trim().length === 0;
  }

  @action
  isShortName(name: string) {
    return name.length <= LONG_NAME_LENGTH;
  }

  @action
  addName() {
    const name = this.nameInput.trim();

    if (this.isAddDisabled) {
      return;
    }

    const key = name.toLowerCase();

    if (!this.args.names.some((n) => n.toLowerCase() === key)) {
      this.args.onChange([...this.args.names, name]);
    }

    this.nameInput = '';
  }

  @action
  removeName(name: string) {
    this.args.onChange(this.args.names.filter((n) => n !== name));
  }

  // Enter adds the name instead of submitting a surrounding form.
  @action
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addName();
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::ManualScanDetails::NameList': typeof SecurityManualScanDetailsNameListComponent;
  }
}
