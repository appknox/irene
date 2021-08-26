import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class AkToggle extends Component {
  toggleId = 'ak-toggle-' + guidFor(this);
}
