import Component from '@glimmer/component';
import styles from './index.scss';

export interface AkDatePickerSignature {
  Args: {
    value?: string | null;
    onChange?: (event: Event, value: string) => void | null;
    minDate?: Date | null;
    maxDate?: Date | null;
    range?: boolean;
    options?: boolean;
    availableYearOffset?: number;
    disabledDates?: boolean;
    disableMonthPicker?: boolean;
    disableYearPicker?: boolean;
    horizontalPosition?: string;
    verticalPosition?: string;
    buttonClasses?: string;
    class?: string;
  };
  Element: HTMLInputElement;
  Blocks: {
    default: [api: [null | Date, null | Date | undefined]];
  };
}

export default class AkDatePickerComponent extends Component<AkDatePickerSignature> {
  get classes() {
    return {
      root: styles['ak-date-picker-root'],
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkDatePicker: typeof AkDatePickerComponent;
  }
}
