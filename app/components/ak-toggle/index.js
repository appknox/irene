import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

export default class AkToggleComponent extends Component {
  get id() {
    return this.args.id || `ak-toggle-${guidFor(this)}`;
  }

  @action
  onClick(event) {
    if (this.args.readonly) {
      event.preventDefault();

      return false;
    }

    if (this.args.onClick) {
      this.args.onClick(event);
    }
  }

  @action
  onChange(event) {
    if (this.args.onChange) {
      this.args.onChange(event, event.target.checked);
    }
  }
}
