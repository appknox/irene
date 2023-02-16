import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { injectSupportWidget } from 'irene/utils/freshdesk';
import { action } from '@ember/object';

import ConfigurationService from './configuration';
import LoggerService from './logger';
import NetworkService from './network';

export default class FreshdeskService extends Service {
  @service('browser/window') declare window: Window;
  @service declare configuration: ConfigurationService;
  @service declare logger: LoggerService;
  @service declare network: NetworkService;

  @tracked widgetAuthToken = '';
  WIDGET_AUTH_ENDPOINT = '/api/v2/freshdesk/authenticate/';

  get freshdeskConfiguration() {
    return this.configuration.integrationData?.freshdesk_configuration;
  }

  get supportWidgetKey() {
    return this.freshdeskConfiguration?.widget_id || '';
  }

  get isSupportWidgetEnabled() {
    const key = this.supportWidgetKey;
    return !!key;
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
    if (!this.isSupportWidgetEnabled) {
      this.logger.debug('Support widget is Disabled');
      return;
    }

    await this.getFreshWidgetToken.perform();
    await injectSupportWidget(this.supportWidgetKey);
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
}
