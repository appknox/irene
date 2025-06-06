import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { runTask, cancelTask } from 'ember-lifeline';
import { Placement } from '@popperjs/core';
import { EmberRunTimer } from '@ember/runloop/types';

import styles from './index.scss';

export interface AkTooltipSignature {
  Element: HTMLDivElement;
  Args: {
    renderInPlace?: boolean;
    disabled?: boolean;
    placement?: Placement;
    arrow?: boolean;
    color?: 'light' | 'dark';
    onClose?: (event: MouseEvent) => void;
    onOpen?: (event: MouseEvent) => void;
    title?: string;
    enterDelay?: number;
    leaveDelay?: number;
  };
  Blocks: { default: []; tooltipContent: [] };
}

export default class AkTooltipComponent extends Component<AkTooltipSignature> {
  @tracked anchorRef: HTMLElement | null = null;

  @tracked runShowToolipLater?: EmberRunTimer | number;
  @tracked runHideToolipLater?: EmberRunTimer | number;

  @action
  handleShowTooltip(event: MouseEvent) {
    if (this.args.disabled) {
      return;
    }

    if (this.args.enterDelay) {
      this.runShowToolipLater = runTask(
        this,
        () => this.showTooltip(event, event.target as HTMLElement),
        this.args.enterDelay
      );
    } else {
      this.showTooltip(event, event.currentTarget as HTMLElement);
    }
  }

  showTooltip(event: MouseEvent, currentTarget: HTMLElement | null) {
    this.anchorRef = currentTarget;

    if (this.args.onOpen) {
      this.args.onOpen({ ...event, currentTarget });
    }
  }

  @action
  handleHideTooltip(event: MouseEvent) {
    if (this.args.disabled) {
      return;
    }

    // cancel if mouse leaves before timeout
    const cancelled = cancelTask(
      this,
      this.runShowToolipLater as EmberRunTimer
    );

    // tooltip never appeared so onClose should not be called
    if (cancelled) {
      return;
    }

    if (this.args.leaveDelay) {
      this.runHideToolipLater = runTask(
        this,
        () => this.hideTooltip(event),
        this.args.leaveDelay
      );
    } else {
      this.hideTooltip(event);
    }
  }

  hideTooltip(event: MouseEvent) {
    this.anchorRef = null;

    if (this.args.onClose) {
      this.args.onClose(event);
    }
  }

  get classes() {
    return {
      akTooltipArrowPopoverRoot: styles['ak-tooltip-arrow-popover-root'],
    };
  }

  get modifiers() {
    return [
      {
        name: 'offset',
        options: {
          offset: [0, this.args.arrow ? 0 : 6],
        },
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkTooltip: typeof AkTooltipComponent;
  }
}
