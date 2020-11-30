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
  default_theme = this.THEMES.DARK;
  default_favicon = ENV.favicon;


  /**
   * @property {String} theme
   * Whitelabel theme will be returned or fallback default to `dark`.
   */
  get theme() {
    if(this.isEnabled()) {
      return ENV.whitelabel.theme
    }
    return this.default_theme;
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

  /**
   * @property {String} favicon
   * Whitelabel favicon will be returned or fallback default to `favicon.ico`.
   */
  get favicon() {
    if(this.isEnabled() && ENV.whitelabel.favicon)  {
      return ENV.whitelabel.favicon;
    }
    return this.default_favicon;
  }
}
