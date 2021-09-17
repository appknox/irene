import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class AkRadioButton extends Component {
  radioBtnId = 'ak-radio-' + guidFor(this);
  @action
  onChange() {
    if (this.args.onChange) {
      this.args.onChange(this.args.value);
    }
  }
}
