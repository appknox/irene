import Service from '@ember/service';
import CONSTANTS from 'irene/utils/constants';
import ENV from 'irene/config/environment';

/**
 * Service:WhitelabelService
 */
export default class WhitelabelService extends Service {

  /**
   * @property {String} name
   * Whitelabel name will be returned or fallback default to Appknox.
   */
  get name() {
    return ENV.whitelabel.enabled ? ENV.whitelabel.name || CONSTANTS.WHITELABEL.DEFAULT_NAME : CONSTANTS.WHITELABEL.DEFAULT_NAME;
  }
}
