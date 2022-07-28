import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import faker from 'faker';

export default class AuthenticatedAppMonitoringRoute extends Route {
  @service organization;

  beforeModel() {
    if (!this.organization.selected.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model() {
    const orgModel = this.organization.selected;
    return {
      settings: await orgModel.get_am_configuration(),
      totalProdScanData: this.createProdScanTableData(31),
    };
  }

  @action createProdScanTableData(numScannedApps = 5) {
    return Array.from({ length: numScannedApps }, this.createScannedApp);
  }

  @action createScannedApp() {
    return {
      id: 31209,
      project: 7601,
      name: faker.random.arrayElement([
        'RootBeer Sample',
        'Unilever Product Label OCR',
        'PList Sample',
      ]),
      scannedOnDate: faker.random.arrayElement([
        'Apr 18, 2022',
        faker.date.past().toLocaleDateString().slice(0, 15),
        '',
      ]),
      package_name: faker.random.arrayElement([
        'com.unilever.productocr',
        'com.bankofceylon.smartpay',
        'com.scottyab.rootbeer.sample',
        'com.appknox.pList-test',
      ]),
      version: this.createFakeVersionNum({ prod_version: false }),
      version_code: '1192',
      production_version: this.createFakeVersionNum({ prod_version: true }),
      production_version_code: '1226',
      file_id: 12345,
      app_url: faker.random.arrayElement([
        'https://play.google.com/store/apps/details?id=org.wordpress.android',
        '',
      ]),
      platform: faker.random.arrayElement(['android', 'apple']),
      status: faker.random.arrayElement([
        'not-initiated',
        'completed',
        'not-found',
      ]),
      released_at: faker.date.recent(),
      created_at: faker.date.past(),
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
