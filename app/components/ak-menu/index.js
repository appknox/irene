import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AkMenuComponent extends Component {
  get modifiers() {
    return [
      {
        name: 'offset',
        options: {
          offset: this.args.offset || [0, this.args.arrow ? 0 : 3],
        },
      },
    ];
  }

  @action
  handleBackdropClick() {
    if (this.args.onClose) {
      this.args.onClose();
    }
  }
}
