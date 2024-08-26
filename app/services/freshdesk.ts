import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { injectSupportWidget, installFreshChat } from 'irene/utils/freshdesk';
import { action } from '@ember/object';

import type ConfigurationService from './configuration';
import type LoggerService from './logger';
import type NetworkService from './network';
import type OrganizationService from './organization';
import type UserModel from 'irene/models/user';

export default class FreshdeskService extends Service {
  @service('browser/window') declare window: Window;
  @service declare configuration: ConfigurationService;
  @service declare logger: LoggerService;
  @service declare network: NetworkService;
  @service declare organization: OrganizationService;

  @tracked widgetAuthToken = '';

  WIDGET_AUTH_ENDPOINT = '/api/v2/freshdesk/authenticate/';

  get freshdeskConfiguration() {
    return this.configuration.integrationData?.freshdesk_configuration;
  }

  get supportWidgetKey() {
    return this.freshdeskConfiguration?.widget_id || '';
  }

  get freshchatKey() {
    return this.configuration.integrationData?.freshchat_key || '';
  }

  get supportWidgetIsEnabled() {
    const key = this.supportWidgetKey;
    return !!key;
  }

  get freshchatEnabled() {
    const key = this.freshchatKey;
    return !!key;
  }

  // Check if fresh chat widget is injected
  get freshChatIsIntegrated() {
    return this.window?.fcWidget && 'object' === typeof this.window.fcWidget;
  }

  openFreshchatWidget() {
    if (!this.freshChatIsIntegrated || this.window.fcWidget.isOpen()) {
      return;
    }

    this.window.fcWidget.open();
  }

  // Destroy widget when user logs out
  destroyFreshchatWidget() {
    if (!this.freshChatIsIntegrated) {
      return;
    }

    this.window.fcWidget.destroy();
  }

  // Check if support widget is injected
  get supportWidgetIsIntegrated() {
    return (
      this.window.FreshworksWidget &&
      'function' === typeof this.window.FreshworksWidget
    );
  }

  openSupportWidget() {
    if (!this.supportWidgetIsIntegrated) {
      return;
    }

    this.window.FreshworksWidget('open');
  }

  hideSupportWidget() {
    if (!this.supportWidgetIsIntegrated) {
      return;
    }

    this.window.FreshworksWidget('hide', 'launcher');
  }

  logUserOutOfSupportWidget() {
    if (!this.supportWidgetIsIntegrated) {
      return;
    }

    this.window.FreshworksWidget('logout');
  }

  @action
  async authWidgetCallback() {
    try {
      const authRes = await this.network.post(this.WIDGET_AUTH_ENDPOINT);
      const widgetAuthData = await authRes.json();

      this.window.FreshworksWidget('authenticate', {
        token: widgetAuthData.token,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @action
  async authenticateSupportWidget(token: string) {
    if (!this.supportWidgetIsIntegrated) {
      return;
    }

    this.window.FreshworksWidget('authenticate', {
      token: token,
      callback: this.authWidgetCallback,
    });
  }

  @action
  async configureSupportWidget() {
    if (!this.supportWidgetIsEnabled) {
      this.logger.debug('Support widget is disabled');

      return;
    }

    await this.getFreshWidgetToken.perform();
    injectSupportWidget(this.supportWidgetKey);
    await this.authenticateSupportWidget(this.widgetAuthToken);

    this.hideSupportWidget();
  }

  getFreshWidgetToken = task(async () => {
    try {
      const authRes = await this.network.post(this.WIDGET_AUTH_ENDPOINT);
      const widgetAuthData = await authRes.json();
      this.widgetAuthToken = widgetAuthData.token;
    } catch (error) {
      this.logger.error(error);
    }
  });

  @action
  configureFreshchat(user: UserModel) {
    if (!this.freshchatEnabled) {
      this.logger.debug('Freshchat is disabled');

      return;
    }

    installFreshChat(user, this.organization.selected, this.freshchatKey);
  }
}
