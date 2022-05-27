import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import faker from 'faker';

export default class AuthenticatedPostProductionScanRoute extends Route {
  @service organization;

  beforeModel() {
    if (!this.organization.selected.features.post_production_scan) {
      this.transitionTo('authenticated.projects');
    }
  }

  // Fake model for test purposes
  async model() {
    const mockPaginatedScannedData = this.createMockProdScanTableData(5);
    const totalProdData = this.createMockProdScanTableData(55);
    return {
      paginatedProdScanData: {
        count: 11,
        next: 'http://api.hooper.appknox.org/api/v1/hooper/project/?limit=5&offset=5',
        previous: null,
        result: mockPaginatedScannedData,
      },
      totalProdData,
    };
  }

  @action createMockProdScanTableData(numScannedApps = 5) {
    return Array.from({ length: numScannedApps }, this.createMockScannedApp);
  }

  @action createMockScannedApp() {
    return {
      project: {
        id: 31209,
        project: 7601,
        profile: 7353,
        name: 'MFVA',
        executable_name: 'com.appknox.mfva',
        file_format: 0,
        file_format_display: 'APK',
        version: '1.0',
        version_code: '6',
        md5hash: 'd3639a92ac2fc10dbc1bd82eab7814d2',
        sha1hash: 'a17a8e47321a01f0a835f40cd50b6b4f8e449f27',
        dynamic_status: 0,
        api_scan_progress: 0,
        device_token: null,
        manual: 0,
        is_static_done: true,
        is_dynamic_done: false,
        static_scan_progress: 100,
        api_scan_status: -1,
        icon_url:
          'https://appknox-production-public.s3.amazonaws.com/2de0ccb5-184e-4a18-9f8b-11ce034948fe.png',
        rating: '18.29',
        is_manual_done: false,
        is_api_done: false,
        risk_count_critical: 1,
        risk_count_high: 3,
        risk_count_medium: 3,
        risk_count_low: 9,
        risk_count_passed: 31,
        risk_count_unknown: 35,
        created_on: '2022-05-23T10:12:19.571855Z',
        min_os_version: '4.4',
        supported_cpu_architectures: [],
        supported_device_types: [],
        tags: [],
        is_active: true,
        can_run_automated_dynamicscan: false,
        can_generate_report: true,
      },
      version: '3.2.1',
      version_code: '12738',
      prod_version: '3.2.0',
      prod_version_code: '99284',
      status: faker.random.arrayElement(['PENDING', 'COMPLETED', 'ERROR']),
      error_code: '402',
      file_id: 2146,
      released_at: faker.date.recent(),
      created_at: faker.date.past(),
    };
  }
}
