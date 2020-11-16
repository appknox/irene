import Service from '@ember/service';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/ja';

export default class DatetimeService extends Service {

  /**
   * @function duration
   * @param {Number} value
   * Method to get duration for given value
   */
  duration(value = 0) {
    dayjs.extend(duration);
    return dayjs.duration(value);
  }

  /**
   * @function setLocale
   * @param {String} lang
   * Method to set active locale globally for date manipulation
   */
  setLocale(lang = 'en') {
    dayjs.locale(lang);
    return true;
  }
}
