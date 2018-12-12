import moment from 'moment';
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
    this.get_scancount(orgId);
    this.get_appscan(orgId);
  },

  async get_scancount(orgId) {
    const scancountUrl = [ENV.endpoints.organizations, orgId, ENV.endpoints.scancount].join('/');
    const scancount = await this.get('ajax').request(scancountUrl)
    this.set("scancount", scancount);
  },

  async get_appscan(orgId) {
    const endDate = new Date().toISOString();
    const startDate = moment(endDate).subtract('30', 'days').toISOString();
    let appscanUrl = [ENV.endpoints.organizations, orgId, ENV.endpoints.appscan].join('/');
    appscanUrl += `?start_date=${startDate}&end_date=${endDate}`;
    const appscan = await this.get('ajax').request(appscanUrl);
    this.set("appscan", appscan);
  }
});
