import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { injectSupportWidget } from 'irene/utils/freshdesk';
import { action } from '@ember/object';

import type ConfigurationService from './configuration';
import type KnowledgeBaseService from './knowledge-base';
import type LoggerService from './logger';
import type IreneAjaxService from './ajax';

type WidgetAuthResponse = {
  token: string;
  name: string;
  email: string;
};

export default class FreshdeskService extends Service {
  @service('browser/window') declare window: Window;
  @service declare configuration: ConfigurationService;
  @service declare knowledgeBase: KnowledgeBaseService;
  @service declare logger: LoggerService;
  @service declare ajax: IreneAjaxService;

  @tracked widgetAuthToken = '';

  WIDGET_AUTH_ENDPOINT = '/api/v2/freshdesk/authenticate/';

  get freshdeskConfiguration() {
    return this.configuration.integrationData?.freshdesk_configuration;
  }

  get supportWidgetKey() {
    return this.freshdeskConfiguration?.widget_id || '';
  }

  get supportWidgetIsEnabled() {
    // Once the HubSpot knowledge base is configured (Help tab or URL) the
    // button opens that instead, so the Freshdesk widget is not loaded at all.
    if (this.knowledgeBase.isAvailable) {
      return false;
    }

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
      const widgetAuthData = await this.ajax.post<WidgetAuthResponse>(
        this.WIDGET_AUTH_ENDPOINT
      );

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
      const widgetAuthData = await this.ajax.post<WidgetAuthResponse>(
        this.WIDGET_AUTH_ENDPOINT
      );

      this.widgetAuthToken = widgetAuthData.token;
    } catch (error) {
      this.logger.error(error);
    }
  });
}
