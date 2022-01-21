import { inject as service } from '@ember/service';
import Service from '@ember/service';
import ENV from 'irene/config/environment';
import { injectDocument360 } from 'irene/utils/knowledge-base';

export default class IntegrationService extends Service {
  @service configuration;
  @service logger;

  // https://github.com/ember-cli/ember-page-title/blob/a886af4d83c7a3a3c716372e8a322258a4f92991/addon/services/page-title-list.js#L27
  // in fastboot context "document" is instance of
  // ember-fastboot/simple-dom document
  @service('-document')
  document;

  currentUser = null;

  get window() {
    return window;
  }

  async configure(user) {
    await this.configuration.getIntegrationConfig();
    this.currentUser = user;
    await this.configureCrisp();
    await this.configureDocument360();
  }

  // Crisp
  async configureCrisp() {
    if (!this.isCrispEnabled()) {
      this.logger.debug('Crisp Disabled');
      return;
    }
    await this.installCrisp();
  }

  async configureDocument360() {
    if (!this.isDocument360Enabled()) {
      this.logger.debug('Document360 Disabled');
      return;
    }
    await injectDocument360(this.document360Key);
  }

  isCrispEnabled() {
    const token = this.crispToken;
    return !!token;
  }

  isDocument360Enabled() {
    return !!this.document360Key;
  }

  get crispToken() {
    return this.configuration.integrationData.crisp_key;
  }

  get document360Key() {
    return this.configuration.integrationData.document360_key;
  }

  // get the snippet code from https://app.crisp.chat/settings/website/
  // the window object is retrieved from this.window;
  // the document object is retrieved from this.document; this is done for fastboot
  // this window.CRISP_WEBSITE_ID is retrieved from configuration module
  async installCrisp() {
    const window = this.window;
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = this.crispToken;
    const d = this.document;
    const s = d.createElement('script');
    s.src = 'https://client.crisp.chat/l.js';
    s.async = 1;
    d.getElementsByTagName('head')[0].appendChild(s);
    window.$crisp.push(['safe', true]);
  }

  // Pendo
  isPendoEnabled() {
    return !!ENV.enablePendo;
  }
}
