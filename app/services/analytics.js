import Service from '@ember/service';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';


export default Service.extend({
  ajax: service('ajax'),
  organization: service('organization'),

  scancount: {},
  appscan: {},

  async load() {
    const orgId = this.get("organization.selected.id");
    const scancountUrl = [ENV.endpoints.organizations, orgId, ENV.endpoints.scancount].join('/');
    const scancount = await this.get('ajax').request(scancountUrl)
    this.set("scancount", scancount);
    const appscanUrl = [ENV.endpoints.organizations, orgId, ENV.endpoints.appscan].join('/');
    const appscan = await this.get('ajax').request(appscanUrl)
    this.set("appscan", appscan);
  }
});
