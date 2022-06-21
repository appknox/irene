import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import faker from 'faker';

export default class AuthenticatedProductionScanRoute extends Route {
  @service organization;
  @service store;

  beforeModel() {
    if (!this.organization.selected.features.post_production_scan) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model() {
    return {
      settings: await this.store.findRecord(
        'production-scan/setting',
        this.organization.selected.id
      ),
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
      app_url:
        'https://play.google.com/store/apps/details?id=org.wordpress.android',
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
