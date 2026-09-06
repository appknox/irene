import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AkDrawerFreestyleDemoComponent extends Component {
  @tracked open = false;

  @action
  handleOpen() {
    this.open = true;
  }

  @action
  handleClose() {
    this.open = false;
  }
}
