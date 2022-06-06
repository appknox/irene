import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import faker from 'faker';

export default class AuthenticatedAppMonitoringRoute extends Route {
  @service organization;
  @service store;

  beforeModel() {
    if (!this.organization.selected.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model() {
    const orgModel = this.organization.selected;

    return {
      settings: await orgModel.get_am_configuration(),
    };
  }

  @action createFakeVersionNum({ prod_version = false }) {
    const generatedVersionNum = `${faker.random.arrayElement([
      1, 2, 3, 5, 6,
    ])}.${faker.random.arrayElement([
      1, 2, 3, 5, 6,
    ])}.${faker.random.arrayElement([1, 2, 3, 5, 6])}`;

    if (prod_version) {
      return faker.random.arrayElement(['Unknown', generatedVersionNum]);
    }

    return generatedVersionNum;
  }
}
