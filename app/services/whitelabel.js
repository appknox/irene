import Service from '@ember/service';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';

export default class WhitelabelService extends Service {
  @service configuration;

  default_name = 'Appknox';
  default_theme = 'dark';
  default_favicon = 'images/favicon.ico';
  default_logo_on_darkbg = '/images/logo-white.png';
  default_logo_on_lightbg = '/images/logo.png';

  THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
  };

  get name() {
    return this.configuration.frontendData.name || this.default_name;
  }

  isEnabled() {
    return ENV.whitelabel.enabled || false;
  }

  get theme() {
    if (this.configuration.themeData.scheme == 'light') {
      return this.THEMES.LIGHT;
    }
    return this.THEMES.DARK;
  }

  get favicon() {
    return this.configuration.imageData.favicon || this.default_favicon;
  }

  get hide_poweredby_logo() {
    return this.configuration.frontendData.hide_poweredby_logo;
  }

  get url() {
    return this.configuration.frontendData.url;
  }

  get logo() {
    const logo = this.client_logo;
    if (logo) {
      return logo;
    }
    if (this.theme === this.THEMES.LIGHT) {
      return this.default_logo_on_lightbg;
    }

    return this.default_logo_on_darkbg;
  }

  get client_logo() {
    // the or'ing order is important
    if (this.theme === this.THEMES.LIGHT) {
      return this.configuration.imageData.logo_on_lightbg;
    }
    return this.configuration.imageData.logo_on_darkbg;
  }
}
