import Controller from '@ember/controller';
import FileModel from 'irene/models/file';
import VulnerabilityModel from 'irene/models/vulnerability';

export default class AuthenticatedDashboardFileVulCompare extends Controller {
  queryParams = [{ referrer: { type: 'string' as const } }];

  declare model: {
    file1: FileModel;
    file2: FileModel;
    vulnerability: VulnerabilityModel;
  };
}
