import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';

/**
 * @function humanizeMonths
 * Method to get list of months in humanized forms
 */
export function humanizeMonths() {
  dayjs.extend(localeData)
  return dayjs().localeData().months();
}
