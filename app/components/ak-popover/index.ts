import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  createPopper,
  Placement,
  Modifier,
  Instance as PopperInstance,
} from '@popperjs/core';

export interface AkPopoverSignature {
  Element: HTMLDivElement;
  Args: {
    anchorRef?: HTMLElement | null;
    arrow?: boolean;
    arrowColor?: 'light' | 'dark';
    sameWidthAsRef?: boolean;
    placement?: Placement;
    modifiers?: Partial<Modifier<string, object>>[];
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
  }

  @action
  elementWillDestroy() {
    this.popper?.destroy();
    this.popper = null;
  }

  willDestroy() {
    super.willDestroy();

    this.popper?.destroy();
    this.popper = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkPopover: typeof PopoverComponent;
  }
}
