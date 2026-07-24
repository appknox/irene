import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AkModalFreestyleDemoComponent extends Component {
  @tracked showModal = false;

  @action
  handleOpenModal() {
    this.showModal = true;
  }

  @action
  handleClose() {
    this.showModal = false;
  }
}
