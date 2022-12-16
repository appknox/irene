import Component from '@glimmer/component';
import styles from './index.scss';

export default class AkAppbar extends Component {
  get classes() {
    return {
      defaultIconBtn: styles['ak-appbar-default-icon-button'],
    };
  }
}
