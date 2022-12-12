import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AkChipComponent extends Component {
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
  onDelete(event) {
    // Stop the event from bubbling up to the `ak-chip`
    event.stopPropagation();

    if (this.args.onDelete) {
      this.args.onDelete(event);
    }
  }
}
