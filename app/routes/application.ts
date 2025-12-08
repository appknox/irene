import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { all } from 'rsvp';
import type IntlService from 'ember-intl/services/intl';

import type { SessionService } from 'irene/adapters/auth-base';
import type ConfigurationService from 'irene/services/configuration';
import type WhitelabelService from 'irene/services/whitelabel';
import type AnalyticsService from 'irene/services/analytics';
import type LoggerService from 'irene/services/logger';

interface HeadDataService {
  title: string;
  favicon: string;
}

export default class ApplicationRoute extends Route {
  @service declare headData: HeadDataService;
  @service declare intl: IntlService;
  @service declare whitelabel: WhitelabelService;
  @service declare configuration: ConfigurationService;
  @service declare analytics: AnalyticsService;
  @service declare session: SessionService;
  @service declare logger: LoggerService;

  async beforeModel(): Promise<void> {
    try {
      await this.session.setup();
    } catch (error) {
      this.logger.error('Failed to setup session', error);
    }

    // Fetch server and frontend configuration
    await all([
      this.configuration.serverConfigFetch(),
      this.configuration.getFrontendConfig(),
    ]);

    try {
      this.analytics.initializePosthog();
    } catch (error) {
      this.logger.error('Failed to initialize PostHog', error);
    }

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
