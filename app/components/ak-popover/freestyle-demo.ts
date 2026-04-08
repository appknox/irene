import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AkPopoverFreestyleDemoComponent extends Component {
  @tracked anchorRef: Element | null = null;

  @action
  handleMoreClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as Element;
  }

  @action
  handleClose() {
    this.anchorRef = null;
  }
}
