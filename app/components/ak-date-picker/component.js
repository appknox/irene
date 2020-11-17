import Component from '@glimmer/component';
import {
  tracked
} from '@glimmer/tracking';
import {
  action
} from '@ember/object';
import {
  guidFor
} from '@ember/object/internals';
import {
  isBlank,
  isEmpty
} from '@ember/utils';
import dayjs from 'dayjs';
import pikaday from 'pikaday';

export default class AkDatePicker extends Component {
  _picker = null;
  containerId = `ak-date-picker-container-${guidFor(this)}`;
  inputId = `ak-date-picker-input-${guidFor(this)}`;

  @tracked minDate;
  @tracked maxDate;

  // Expect unix timestamp format from data binding
  valueFormat = 'X';

  // The format to display in the text field
  format = 'YYYY-MM-DD';

  // Whether `null` input date / result is allowed
  @tracked allowBlank = false;

  // Whether the input date should be considered a UTC date
  utc = false;

  // The input date
  @tracked date = null;

  // The allowed year range
  @tracked yearRange = [dayjs().year() - 3, dayjs().year() + 4];

  // The allowed year range as an array of integers
  get yearRangePair() {
    const yearRange = Array.isArray(this.yearRange) ?
      this.yearRange :
      this.yearRange.split(',');

    const startYear = parseInt(yearRange[0], 10);
    const endYear = parseInt(yearRange[1], 10);

    // assume we're in absolute form if the start year > 1000
    if (startYear > 1000) {
      return yearRange;
    }

    // relative form must be updated to absolute form
    const currentYear = dayjs().year();

    return [currentYear + startYear, currentYear + endYear];
  }

  /**
   * Setup Pikaday element after component was inserted.
   */
  @action
  setupDatepicker(element) {
    const container = document.getElementById(this.containerId);

    const pickerOptions = {
      container,
      field: element,
      yearRange: this.yearRangePair,
      clearInvalidInput: true,
      maxDate: new Date(),

      /**
       * After the Pikaday component was closed, read the selected value
       * from the input field (remember we're extending TextField!).
       *
       * If that value is empty or no valid date, depend on `allowBlank` if
       * the `date` binding will be set to `null` or to the current date.
       *
       * Format the "outgoing" date with respect to the given `format`.
       */
      onClose: () => {
        // use `dayjs` or `dayjs.utc` depending on `utc` flag
        const dayJsFn = this.utc ? dayjs.utc : dayjs;
        let date = dayJsFn(this.value, this.format);

        // has there been a valid date or any value at all?
        if (!date.isValid() || !this.value) {
          if (this.allowBlank) {
            // allowBlank means `null` is ok, so use that
            this.date = null;
            return null;
          }

          // "fallback" to current date
          date = dayJsFn();
        }

        this.args.onChange(dayjs(date, this.format));
      },

      onSelect: (date) => {
        this.args.onChange(dayjs(date, this.format));
      }
    };

    const pickerOptionKeys = [
      'bound',
      'position',
      'reposition',
      'format',
      'firstDay',
      'minDate',
      'maxDate',
      'showWeekNumber',
      'isRTL',
      'i18n',
      'yearSuffix',
      'disableWeekends',
      'disableDayFn',
      'showMonthAfterYear',
      'numberOfMonths',
      'mainCalendar',
      'showDaysInNextAndPreviousMonths',
      'enableSelectionDaysInNextAndPreviousMonths',
      'numberOfMonths',
      'theme'
    ];

    pickerOptionKeys.forEach(key => {
      const value = this[key] == null ? this.args[key] : this[key];

      if (!isEmpty(value)) {
        pickerOptions[key] = value;
      }
    });

    this._picker = new pikaday(pickerOptions);
    this.setDate();
  }

  _serializeDate(date) {
    switch (this.valueFormat) {
      case 'date': {
        return date.toDate();
      }
      case 'dayjs': {
        return dayjs(date);
      }
      default: {
        return date.format(this.valueFormat);
      }
    }
  }


  _unserializeDate(date) {
    switch (this.valueFormat) {
      case 'date': {
        return date.toDate();
      }
      case 'dayjs': {
        return dayjs(date);
      }
      default: {
        return dayjs(date, this.valueFormat);
      }
    }
  }

  /**
   * Propper teardown to remove Pickady from the dom when the component gets
   * destroyed.
   */
  willDestroy() {
    if (this._picker) {
      this._picker.destroy();
    }
  }

  get _pickerDate() {
    if (!isBlank(this.date)) {
      // serialize day.js date either from plain date object or string
      return this._unserializeDate(this.date);
    }

    // no date was found in data source. Either respect that or set it to now
    if (this.allowBlank) {
      return null;
    }

    const date = dayjs();
    // also set the controllers date here. If the controller passes in a
    // null date, it is assumed that todays date should be used
    this.date = this._serializeDate(date);

    return date;
  }

  /**
   * Update Pikaday's displayed date after bound `date` changed and also after
   * the initial `didInsertElement`.
   *
   * Depending on the format in `valueFormat`, serialize date object from plain
   * JS Date or from specified string format.
   *
   * If no `date` is set in the data source, it depends on `allowBlank` whether
   * "new Date()" is used or an invalid date will force Pikaday to clear the
   * input element shown on the page.
   */
  setDate() {
    this._picker.setDate(this._pickerDate);
  }

  /**
   * Update Pikaday's minDate after bound `minDate` changed and also after
   * the initial `didInsertElement`.
   */
  setMinDate() {
    if (!isBlank(this.minDate)) {
      this._picker.setMinDate(this.minDate);
    }
  }

  /**
   * Update Pikaday's maxDate after bound `maxDate` changed and also after
   * the initial `didInsertElement`.
   */
  setMaxDate() {
    if (!isBlank(this.maxDate)) {
      this._picker.setMaxDate(this.maxDate);
    }
  }
}
