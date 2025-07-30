import Component from '@glimmer/component';
import { action } from '@ember/object';

import {
  createPopper,
  Placement,
  Modifier,
  Instance as PopperInstance,
} from '@popperjs/core';

import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export interface AkPopoverSignature {
  Element: HTMLDivElement;
  Args: {
    anchorRef?: HTMLElement | null;
    arrow?: boolean;
    arrowColor?: 'light' | 'dark';
    arrowClass?: string;
    sameWidthAsRef?: boolean;
    placement?: Placement;
    modifiers?: Partial<Modifier<string, object>>[];
    renderInPlace?: boolean;
    containerClass?: string;
    hasBackdrop?: boolean;
    onBackdropClick?: (event: MouseEvent) => void;
    clickOutsideToClose?: boolean;
    closeHandler?: () => void;
    mountOnOpen?: boolean;
    unmountOnClose?: boolean;
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
  popperElement: HTMLElement | null = null;

  // Dependencies for the toggleMountContent effect
  toggleMountContentDependencies = {
    anchorRef: () => this.args.anchorRef,
  };

  @tracked mountContent = false;

  isEmpty(value: unknown) {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && !value.trim())
    );
  }

  get anchorRef() {
    return this.args.anchorRef;
  }

  /**
   * Determines whether the content should be mounted as soon as AkPopover is instantiated.
   *
   * If `mountOnOpen` is `true` or `undefined`, the content is mounted only when an `anchorRef` is provided (i.e an `element`).
   *
   * If `mountOnOpen` is `false`, the content is mounted by default whether the anchorRef is an `element` or `null`
   * (i.e whether the popover is opened or closed).
   *
   * @see `this.toggleMountContent` for info about the content toggle logic
   *
   */
  get mountOnOpen() {
    if (this.isEmpty(this.args.mountOnOpen)) {
      return true;
    }

    return this.args.mountOnOpen;
  }

  /**
   * Determines whether the content should be unmounted when the popover is closed.
   *
   * If `unmountOnClose` is `true` or `undefined`, the content is unmounted whenever the popover is closed.
   *
   * If `unmountOnClose` is `false`, the content is left unmounted after being rendered whether the anchorRef is an `element` or `null`
   * (i.e whether the popover is opened or closed).
   *
   * @see `this.toggleMountContent` for info about the content toggle logic
   *
   */
  get unmountOnClose() {
    if (this.isEmpty(this.args.unmountOnClose)) {
      return true;
    }

    return this.args.unmountOnClose;
  }

  @action
  elementInserted(element: HTMLDivElement) {
    this.popperElement = element;
    this.createPopperInstance();
  }

  @action createPopperInstance() {
    if (this.anchorRef && this.popperElement) {
      this.popper = createPopper(this.anchorRef, this.popperElement, {
        placement: this.args.placement || this.defaultPlacement,
        modifiers: [
          ...this.defaultModifiers,
          sameWidth(Boolean(this.args.sameWidthAsRef)),
          ...(this.args.modifiers || []),
        ],
      });

      if (this.args.closeHandler && this.args.clickOutsideToClose) {
        // Register click outside event listener when popper instance is created
        this.window.addEventListener('mousedown', this.handleOutsideClick);
      }
    }
  }

  /**
   * Simply decides whether to show the content or not
   * based on subsequent states of the `anchorRef` after `AkPopover` is instantiated
   */
  @action
  toggleMountContent() {
    if (this.anchorRef) {
      this.createPopperInstance();

      this.mountContent = true;
    } else if (this.popper) {
      this.popper.destroy();
      this.popper = null;

      this.mountContent = !this.unmountOnClose;
    } else {
      this.mountContent = !this.mountOnOpen;
    }
  }

  /**
   * Handler for when the backdrop element is clicked
   */
  @action
  handleBackdropClick(event: MouseEvent) {
    this.args.onBackdropClick?.(event);
  }

  /**
   * If `clickOutsideToClose` is `true`, this function simply triggers the close handler
   * by checking if clicked element is not the trigger element or popover element
   */
  @action
  handleOutsideClick(event: MouseEvent) {
    if (this.popper) {
      const anchorRef = this.popper.state.elements.reference as HTMLElement;

      if (
        !this.popperElement?.contains(event.target as Node) &&
        anchorRef &&
        !anchorRef.contains(event.target as Node)
      ) {
        this.args.closeHandler?.();
      }
    }
  }

  @action
  handleWillDestroyCleanup() {
    if (this.args.closeHandler && this.args.clickOutsideToClose) {
      // Unregister click outside event listener when popover closes
      this.window.removeEventListener('mousedown', this.handleOutsideClick);
    }
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
