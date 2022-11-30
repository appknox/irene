import Component from '@glimmer/component';
import { action } from '@ember/object';
import { createPopper } from '@popperjs/core';

const sameWidth = (enabled) => ({
  name: 'sameWidth',
  enabled,
  phase: 'beforeWrite',
  requires: ['computeStyles'],
  fn: ({ state }) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  effect: ({ state }) => {
    state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
  },
});

export default class PopoverComponent extends Component {
  defaultPlacement = 'bottom';
  defaultModifiers = [];

  popper = null;

  @action
  elementInserted(element) {
    this.popper = createPopper(this.args.anchorRef, element, {
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
    super.willDestroy(...arguments);

    this.popper?.destroy();
    this.popper = null;
  }
}
