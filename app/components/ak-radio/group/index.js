import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

export default class AkRadioGroupComponent extends Component {
  @tracked value = '';

  get name() {
    return this.args.name || `ak-radio-${guidFor(this)}`;
  }

  get groupDirection() {
    return this.args.groupDirection || 'column';
  }

  get finalValue() {
    return this.isEmpty(this.args.value) ? this.value : this.args.value;
  }

  isEmpty(value) {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && !value.trim())
    );
  }

  @action
  handleChange(event) {
    this.value = event.target.value;

    if (this.args.onChange) {
      this.args.onChange(event, event.target.value);
    }
  }
}
