import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AkCheckboxComponent extends Component {
  @tracked isChecked = false;

  get id() {
    return this.args.id || `ak-checkbox-${guidFor(this)}`;
  }

  get checked() {
    if (this.args.indeterminate) {
      return false;
    }

    return this.args.checked || this.isChecked;
  }

  @action
  onChange(event) {
    if (this.args.checked === null || this.args.checked === undefined) {
      this.isChecked = event.target.checked;
    }

    if (this.args.onChange) {
      this.args.onChange(event, event.target.checked);
    }
  }

  noop() {}
}
