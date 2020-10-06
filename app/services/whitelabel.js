import Service from '@ember/service';
import CONSTANTS from 'irene/utils/constants';
import ENV from 'irene/config/environment';

/**
 * Service:WhitelabelService
 */
export default class WhitelabelService extends Service {

  /**
   * @property {Boolean} isWhitelabelEnabled
   */
  isWhitelabelEnabled = ENV.whitelabel.enabled;

  /**
   * @property {String | NULL} whitelabelName
   */
  whitelabelName = ENV.whitelabel.name || null;

  /**
   * @property {String} activeWhiltelabelName
   */
  activeWhiltelabelName = this.isWhitelabelEnabled ? this.whitelabelName || CONSTANTS.WHITELABEL.DEFAULT_NAME : CONSTANTS.WHITELABEL.DEFAULT_NAME;
}
