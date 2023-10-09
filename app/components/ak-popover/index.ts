import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  createPopper,
  Placement,
  Modifier,
  Instance as PopperInstance,
} from '@popperjs/core';
import { inject as service } from '@ember/service';

export interface AkPopoverSignature {
  Element: HTMLDivElement;
  Args: {
    anchorRef?: HTMLElement | null;
    arrow?: boolean;
    arrowColor?: 'light' | 'dark';
    sameWidthAsRef?: boolean;
    placement?: Placement;
    modifiers?: Partial<Modifier<string, object>>[];
    renderInPlace?: boolean;
    containerClass?: string;
    hasBackdrop?: boolean;
    onBackdropClick?: (event: MouseEvent) => void;
    clickOutsideToClose?: boolean;
    closeHandler?: () => void;
  };
  Blocks: { default: [] };
}

type SameWidthFunc = (enabled: boolean) => Modifier<'sameWidth', object>;

const sameWidth: SameWidthFunc = (enabled: boolean) => ({
  name: 'sameWidth',
  enabled,
  phase: 'beforeWrite',
  requires: ['computeStyles'],
  fn: ({ state }) => {
    if (state.styles['popper']) {
      state.styles['popper'].width = `${state.rects.reference.width}px`;
    }
  },
  effect: ({ state }) => {
    const refElement = state.elements.reference as HTMLElement;
    state.elements.popper.style.width = `${refElement.offsetWidth}px`;
  },
});

export default class PopoverComponent extends Component<AkPopoverSignature> {
  @service('browser/window') declare window: Window;

  defaultPlacement: Placement = 'auto';
  defaultModifiers = [];

  popper: PopperInstance | null = null;

  @action
  elementInserted(anchorRef: HTMLElement, element: HTMLDivElement) {
    this.popper = createPopper(anchorRef, element, {
      placement: this.args.placement || this.defaultPlacement,
      modifiers: [
        ...this.defaultModifiers,
        sameWidth(Boolean(this.args.sameWidthAsRef)),
        ...(this.args.modifiers || []),
      ],
    });

    if (this.args.closeHandler && this.args.clickOutsideToClose) {
      // Register click outside event listener when popover opens
      this.window.addEventListener('mousedown', this.handleOutsideClick);
    }
  }

  @action
  handleWillDestroyCleanup() {
    this.popper?.destroy();
    this.popper = null;

    if (this.args.closeHandler && this.args.clickOutsideToClose) {
      // Unregister click outside event listener when popover closes
      this.window.removeEventListener('mousedown', this.handleOutsideClick);
    }
  }

  @action
  handleOutsideClick(event: MouseEvent) {
    if (this.popper) {
      const popoverElement = this.popper.state.elements.popper as HTMLElement;
      const anchorRef = this.popper.state.elements.reference as HTMLElement;

      if (
        !popoverElement.contains(event.target as Node) &&
        anchorRef &&
        !anchorRef.contains(event.target as Node)
      ) {
        this.args.closeHandler?.();
      }
    }
  }

  @action
  handleBackdropClick(event: MouseEvent) {
    this.args.onBackdropClick?.(event);
  }

  willDestroy() {
    super.willDestroy();

    this.handleWillDestroyCleanup();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkPopover: typeof PopoverComponent;
  }
}
