import Service from '@ember/service';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type ConfigurationService from './configuration';
import type LoggerService from './logger';

export default class RegistrationService extends Service {
  @service declare configuration: ConfigurationService;
  @service declare router: RouterService;
  @service declare logger: LoggerService;

  externalURLRegex = /^https?:\/\//i;

  shouldShowInLogin() {
    if (this.isEnabled()) {
      return true;
    }

    return this.isExternalLink();
  }

  isEnabled() {
    return this.configuration.frontendData.registration_enabled == true;
  }

  isExternalLink() {
    const link = this.link;
    if (!link) {
      return false;
    }
    return this.externalURLRegex.test(link);
  }

  get link() {
    return this.configurationLink || this.routerLink;
  }

  get routerLink() {
    try {
      return this.router.urlFor('register');
    } catch (err) {
      this.logger.warn(err);
      return '';
    }
  }

  get configurationLink() {
    return this.configuration.frontendData.registration_link;
  }
}
