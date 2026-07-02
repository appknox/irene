import Component from '@glimmer/component';
import { action } from '@ember/object';
import { runTask } from 'ember-lifeline';

export interface DrawerSignature {
  Element: HTMLDivElement;
  Args: {
    open?: boolean;
    anchor?: 'left' | 'right';
    disableBackdropClick?: boolean;
    drawerContainerClass?: string;
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
    runTask(this, () => this.args.onClose(), 300);

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
    this.backdropElement = element;

    // A 0ms delay doesn't reliably let the browser paint the starting
    // opacity/transform before this flips to the ending state -- some
    // browsers coalesce both into a single frame, so the drawer just pops
    // in instead of sliding/fading. A short, non-zero delay (still routed
    // through runTask, so it stays test-safe and destroy-safe) gives the
    // initial state a real paint first.
    runTask(
      this,
      () => {
        element.style.opacity = '1';
        element.style.transition = 'opacity 225ms ease-in-out 0ms';
      },
      20
    );
  }

  @action
  drawerInserted(element: HTMLElement) {
    this.drawerElement = element;

    runTask(
      this,
      () => {
        element.style.transform = 'none';
        element.style.transition = 'transform 225ms ease-out 0ms';
      },
      20
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkDrawer: typeof DrawerComponent;
  }
}
