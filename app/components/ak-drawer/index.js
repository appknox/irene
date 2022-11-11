import Component from '@glimmer/component';
import { action } from '@ember/object';
import { later } from '@ember/runloop';

export default class DrawerComponent extends Component {
  backdropElement = null;
  drawerElement = null;

  constructor() {
    super(...arguments);

    if (!this.args.onClose) {
      throw new Error('No onClose handler is set');
    }
  }

  @action
  handleBackdropClick() {
    if (!this.args.disableBackdropClick) {
      this.handleDrawerClose();
    }
  }

  @action
  handleDrawerClose() {
    later(() => {
      this.args.onClose();
    }, 300);

    if (this.backdropElement) {
      this.backdropElement.style.opacity = 0;
    }

    if (this.drawerElement) {
      this.drawerElement.style.transform = `translateX(${
        this.args.anchor === 'right' ? '100%' : '-100%'
      })`;
    }
  }

  @action
  backdropInserted(element) {
    later(() => {
      this.backdropElement = element;

      element.style.opacity = 1;
      element.style.transition = 'opacity 225ms ease-in-out 0ms';
    });
  }

  @action
  drawerInserted(element) {
    later(() => {
      this.drawerElement = element;

      element.style.transform = 'none';
      element.style.transition = 'transform 225ms ease-out 0ms';
    });
  }
}
