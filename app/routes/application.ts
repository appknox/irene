import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { all } from 'rsvp';
import type IntlService from 'ember-intl/services/intl';

import type ConfigurationService from 'irene/services/configuration';
import type WhitelabelService from 'irene/services/whitelabel';
import type AnalyticsService from 'irene/services/analytics';

export default class ApplicationRoute extends Route {
  @service declare headData: any;
  @service declare intl: IntlService;
  @service declare whitelabel: WhitelabelService;
  @service declare configuration: ConfigurationService;
  @service declare analytics: AnalyticsService;
  @service declare session: any;

  async beforeModel(): Promise<void> {
    await this.session.setup();

    await all([
      this.configuration.serverConfigFetch(),
      this.configuration.getFrontendConfig(),
      this.analytics.initializePosthog(),
    ]);

    return this.intl.setLocale(['en']);
  }

  afterModel(): void {
    this.headData.title = this.whitelabel.name;
    this.headData.favicon = this.whitelabel.favicon;
  }

  model() {
    return {
      body_classes: `theme-${this.whitelabel.theme}`,
    };
  }
}
