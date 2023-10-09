import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Modifier } from '@popperjs/core';
import { WithBoundArgs } from '@glint/template';

import AkListItemComponent from 'irene/components/ak-list/item';
import styles from './index.scss';

export interface AkMenuSignature {
  Args: {
    anchorRef?: HTMLElement | null;
    offset?: [number, number];
    renderInPlace?: boolean;
    arrow?: boolean;
    onClose?: () => void;
    sameWidthAsRef?: boolean;
    role?: string;
  };
  Blocks: {
    default: [
      { listItem: WithBoundArgs<typeof AkListItemComponent, 'button' | 'role'> }
    ];
  };
}

export default class AkMenuComponent extends Component<AkMenuSignature> {
  get modifiers(): Partial<Modifier<string, object>>[] {
    return [
      {
        name: 'offset',
        options: {
          offset: this.args.offset || [0, this.args.arrow ? 0 : 3],
        },
      },
    ];
  }

  get classes() {
    return {
      akMenuArrowPopoverRoot: styles['ak-menu-arrow-popover-root'],
    };
  }

  @action
  handleBackdropClick() {
    if (this.args.onClose) {
      this.args.onClose();
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkMenu: typeof AkMenuComponent;
  }
}
