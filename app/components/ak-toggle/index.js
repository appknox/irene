import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

export default class AkToggleComponent extends Component {
  @tracked isChecked = false;

  get id() {
    return this.args.id || `ak-toggle-${guidFor(this)}`;
  }

  get checked() {
    return !this.isEmpty(this.args.checked)
      ? this.args.checked
      : this.isChecked;
  }

  isEmpty(value) {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && !value.trim())
    );
  }

  @action
  onChange(event) {
    if (this.isEmpty(this.args.checked)) {
      this.isChecked = event.target.checked;
    }

    if (this.args.onChange) {
      this.args.onChange(event, event.target.checked);
    }
  }
}
