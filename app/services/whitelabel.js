import Service from '@ember/service';
import ENV from 'irene/config/environment';

/**
 * Service:WhitelabelService
 */
export default class WhitelabelService extends Service {

  isEnabled() {
    return ENV.whitelabel.enabled || false;
  }

  THEMES = {
    'DARK': 'dark',
    'LIGHT': 'light'
  }

  default_name = "Appknox";
  defautl_theme = this.THEMES.DARK;


  /**
   * @property {String} theme
   * Whitelabel theme will be returned or fallback default to `dark`.
   */
  get theme() {
    if(this.isEnabled()) {
      return ENV.whitelabel.theme
    }
    return this.defautl_theme;
  }

  /**
   * @property {String} name
   * Whitelabel name will be returned or fallback default to `Appknox`.
   */
  get name() {
    if(this.isEnabled())  {
      return ENV.whitelabel.name;
    }
    return this.default_name;
  }
}
