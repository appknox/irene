import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import ConfigurationService from 'irene/services/configuration';

export default class StatusRoute extends Route {
  @service declare configuration: ConfigurationService;

  async beforeModel(): Promise<void> {
    await this.configuration.getDashboardConfig();
  }
}
