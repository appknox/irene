import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { injectSupportWidget } from 'irene/utils/freshdesk';
import { action } from '@ember/object';

export default class FreshdeskService extends Service {
  @service('browser/window') window;
  @service configuration;
  @service logger;
  @service network;

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
  async authenticateSupportWidget(token) {
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

  @task(function* () {
    try {
      const authRes = yield this.network.post(this.WIDGET_AUTH_ENDPOINT);
      const widgetAuthData = yield authRes.json();
      this.widgetAuthToken = widgetAuthData.token;
    } catch (error) {
      this.logger.error(error);
    }
  })
  getFreshWidgetToken;
}
