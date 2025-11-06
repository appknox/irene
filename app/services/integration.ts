import { inject as service } from '@ember/service';
import Service from '@ember/service';
import ENV from 'irene/config/environment';
import UserModel from 'irene/models/user';

import ConfigurationService from './configuration';
import LoggerService from './logger';
import FreshdeskService from './freshdesk';

export default class IntegrationService extends Service {
  // https://github.com/ember-cli/ember-page-title/blob/a886af4d83c7a3a3c716372e8a322258a4f92991/addon/services/page-title-list.js#L27
  // in fastboot context "document" is instance of
  // ember-fastboot/simple-dom document
  @service('-document') declare document: Document;
  @service declare configuration: ConfigurationService;
  @service declare logger: LoggerService;
  @service declare freshdesk: FreshdeskService;

  currentUser: UserModel | null = null;

  get window() {
    return window;
  }

  willDestroy() {
    super.willDestroy();
  }

  async configure(user: UserModel) {
    await this.configuration.getIntegrationConfig();

    this.currentUser = user;

    // Freshdesk integrations
    await this.freshdesk.configureSupportWidget();
    this.freshdesk.configureFreshchat(user);
  }

  // Pendo
  isPendoEnabled() {
    return !!ENV.enablePendo;
  }

  // Customer Success Box (CSB)
  isCSBEnabled() {
    return !!ENV.enableCSB;
  }
}
