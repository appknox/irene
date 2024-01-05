import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { all } from 'rsvp';

import ConfigurationService from 'irene/services/configuration';
import WhitelabelService from 'irene/services/whitelabel';

export default class ApplicationRoute extends Route {
  @service declare headData: any;
  @service declare intl: IntlService;
  @service declare whitelabel: WhitelabelService;
  @service declare configuration: ConfigurationService;
  @service declare session: any;

  async beforeModel(): Promise<void> {
    await this.session.setup();

    await all([
      this.configuration.serverConfigFetch(),
      this.configuration.getFrontendConfig(),
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
