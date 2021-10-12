import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class AkCheckbox extends Component {
  checkboxId = 'ak-checkbox-' + guidFor(this);
}
