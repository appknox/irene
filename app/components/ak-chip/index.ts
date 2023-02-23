import Component from '@glimmer/component';
import { action } from '@ember/object';

export type AkChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warn'
  | 'info';

interface AkChipSignature {
  Element: HTMLDivElement;
  Args: {
    button?: boolean;
    onDelete?: (event: MouseEvent) => void;
    label?: string;
    variant?: 'filled' | 'semi-filled' | 'outlined';
    color?: AkChipColor;
    size?: 'medium' | 'small';
  };

  Blocks: {
    icon?: [];
    deleteIcon?: [];
  };
}

export default class AkChipComponent extends Component<AkChipSignature> {
  noop() {}

  get hasDeleteAction() {
    return Boolean(this.args.onDelete);
  }

  get variant() {
    return this.args.variant || 'filled';
  }

  get color() {
    return this.args.color || 'default';
  }

  get size() {
    return this.args.size || 'medium';
  }

  get isSizeSmall() {
    return this.size === 'small';
  }

  get isVariantOutlined() {
    return this.variant === 'outlined';
  }

  @action
  onDelete(event: MouseEvent) {
    // Stop the event from bubbling up to the `ak-chip`
    event.stopPropagation();

    if (this.args.onDelete) {
      this.args.onDelete(event);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkChip: typeof AkChipComponent;
  }
}
