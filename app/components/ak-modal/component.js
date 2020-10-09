import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AkModalComponent extends Component {

  constructor() {
    super(...arguments);
  }

  @action
  onClose() {
    this.args.onClose();
  }
}
