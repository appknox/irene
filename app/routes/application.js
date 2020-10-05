import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import CONSTANTS from 'irene/utils/constants';

export default class ApplicationRoute extends Route {
  @service headData;
  @service intl;

  beforeModel() {
    return this.get('intl').setLocale(['en']);
  }

  afterModel() {
    this.headData.title = "Appknox";
  }

  /**
   * Returns model include following
   * {
   *  whitelabelName => Active whitelable name
   * }
   */
  model() {
    return {
      whitelabelName: ENV.whitelabel.enabled ? ENV.whitelabel.name || CONSTANTS.WHITELABEL.DEFAULT_NAME : CONSTANTS.WHITELABEL.DEFAULT_NAME
    }
  }
}
