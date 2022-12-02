import EmberPowerSelect from 'ember-power-select/components/power-select';
import styles from './index.scss';
import { guidFor } from '@ember/object/internals';

export default class AkSelectComponent extends EmberPowerSelect {
  get labelId() {
    return this.args.labelId || `ak-select-${guidFor(this)}`;
  }

  get classes() {
    return {
      dropdown: styles['ak-select-dropdown'],
      trigger: styles['ak-select-trigger'],
      triggerError: styles['ak-select-trigger-error'],
    };
  }
}
