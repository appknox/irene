import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class TextFieldComponent extends Component {
  get id() {
    return this.args.id || `ak-textfield-${guidFor(this)}`;
  }
}
