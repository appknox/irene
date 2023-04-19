import Component from '@glimmer/component';
import { action } from '@ember/object';
import { later } from '@ember/runloop';

export interface DrawerSignature {
  Element: HTMLDivElement;
  Args: {
    open?: boolean;
    anchor?: 'left' | 'right';
    disableBackdropClick?: boolean;
    onClose: () => void;
  };
  Blocks: { default: [{ closeHandler: () => void }] };
}

export default class DrawerComponent extends Component<DrawerSignature> {
  backdropElement: HTMLElement | null = null;
  drawerElement: HTMLElement | null = null;

  constructor(owner: unknown, args: DrawerSignature['Args']) {
    super(owner, args);

    if (!this.args.onClose) {
      throw new Error('No onClose handler is set');
    }
  }

  get anchor() {
    return this.args.anchor || 'left';
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
      this.backdropElement.style.opacity = '0';
    }

    if (this.drawerElement) {
      this.drawerElement.style.transform = `translateX(${
        this.args.anchor === 'right' ? '100%' : '-100%'
      })`;
    }
  }

  @action
  backdropInserted(element: HTMLElement) {
    later(() => {
      this.backdropElement = element;

      element.style.opacity = '1';
      element.style.transition = 'opacity 225ms ease-in-out 0ms';
    }, 0);
  }

  @action
  drawerInserted(element: HTMLElement) {
    later(() => {
      this.drawerElement = element;

      element.style.transform = 'none';
      element.style.transition = 'transform 225ms ease-out 0ms';
    }, 0);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkDrawer: typeof DrawerComponent;
  }
}
