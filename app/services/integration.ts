import { inject as service } from '@ember/service';
import Service from '@ember/service';
import ENV from 'irene/config/environment';
import type UserModel from 'irene/models/user';

import type ConfigurationService from './configuration';
import type LoggerService from './logger';
import type FreshdeskService from './freshdesk';
import type HubspotService from './hubspot';

export default class IntegrationService extends Service {
  // https://github.com/ember-cli/ember-page-title/blob/a886af4d83c7a3a3c716372e8a322258a4f92991/addon/services/page-title-list.js#L27
  // in fastboot context "document" is instance of
  // ember-fastboot/simple-dom document
  @service('-document') declare document: Document;
  @service declare configuration: ConfigurationService;
  @service declare logger: LoggerService;
  @service declare freshdesk: FreshdeskService;
  @service declare hubspot: HubspotService;

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

    // Freshdesk knowledge base widget
    await this.freshdesk.configureSupportWidget();

    // HubSpot chat. Not awaited so that identifying the visitor never delays
    // the app from loading. It handles its own errors.
    this.hubspot.configureChat();
  }

  // Pendo
  isPendoEnabled() {
    return !!ENV.enablePendo;
  }
}
