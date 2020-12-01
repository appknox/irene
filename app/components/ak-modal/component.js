import Component from '@glimmer/component';
import {
  action
} from '@ember/object';

export default class AkModalComponent extends Component {

  @action
  onClose() {
    this.args.onClose();
  }
}
