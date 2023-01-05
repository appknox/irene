import Component from '@glimmer/component';
import styles from './index.scss';

export default class AkDatePickerComponent extends Component {
  get classes() {
    return {
      root: styles['ak-date-picker-root'],
    };
  }
}
