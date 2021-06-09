import Service from '@ember/service';
import ENV from 'irene/config/environment';
import {
  inject as service
} from '@ember/service';
import dayjs from 'dayjs';
import { all } from 'rsvp';


export default Service.extend({
  ajax: service('ajax'),
  organization: service('organization'),

  scancount: {},
  appscan: {},

  async load() {
    await all([
      this.get_scancount(),
      this.get_appscan(),
    ]);
  },

  async get_scancount() {
    const orgId = this.get("organization.selected.id");
    const scancountUrl = [ENV.endpoints.organizations, orgId, ENV.endpoints.scancount].join('/');
    const scancount = await this.get('ajax').request(scancountUrl)
    this.set("scancount", scancount);
  },

  async get_appscan() {
    const orgId = this.get("organization.selected.id");
    const endDate = new Date().toISOString();
    const startDate = dayjs(endDate).subtract(180, 'day').toISOString();
    let appscanUrl = [ENV.endpoints.organizations, orgId, ENV.endpoints.appscan].join('/');
    appscanUrl += `?start_date=${startDate}&end_date=${endDate}`;
    const appscan = await this.get('ajax').request(appscanUrl);
    this.set("appscan", appscan);
  }

});
