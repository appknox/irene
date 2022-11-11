import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

export default class AkRadioComponent extends Component {
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
    if (this.args.checked) {
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

  isEmpty(value) {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && !value.trim())
    );
  }

  areEqualValues(a, b) {
    if (typeof b === 'object' && b !== null) {
      return a === b;
    }

    // The value could be a number, the DOM will stringify it anyway.
    return String(a) === String(b);
  }

  @action
  onChange(event) {
    this.args.radioCtx?.handleChange(event);

    if (this.args.onChange) {
      this.args.onChange(event, event.target.checked);
    }
  }
}
