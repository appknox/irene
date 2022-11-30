import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AkTooltipComponent extends Component {
  @tracked anchorRef = null;

  @action
  handleShowTooltip(event) {
    if (this.args.disabled) {
      return;
    }

    this.anchorRef = event.currentTarget;

    if (this.args.onOpen) {
      this.args.onOpen(event);
    }
  }

  @action
  handleHideTooltip(event) {
    if (this.args.disabled) {
      return;
    }

    this.anchorRef = null;

    if (this.args.onClose) {
      this.args.onClose(event);
    }
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
