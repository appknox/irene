import Component from '@glimmer/component';
import styles from './index.scss';

export default class AkModalComponent extends Component {
  noop() {}

  get classes() {
    return {
      overlay: styles['ak-modal-overlay'],
      overlayBlur: styles['ak-modal-overlay-blur'],
    };
  }
}
