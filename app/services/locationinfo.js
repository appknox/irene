/* eslint-disable prettier/prettier */
import Service from '@ember/service';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';

export default class LocationinfoService extends Service {
  @service ajax;

  async getDataFromCloudFlare() {
    const data = await this.ajax.request('https://www.cloudflare.com/cdn-cgi/trace', {'dataType':'text'});
    const cloudflareData = data.split('\n').reduce((obj, value) => {
      const splitvalue = value.split('=');
      obj[splitvalue[0]] = splitvalue[1];
      return obj;
    }, {});
    return cloudflareData;
  }

  async getCountry() {
    try {
      const data = await this.getDataFromCloudFlare();
      if(data && data['loc']) {
        return data['loc'];
      }
    } catch(error) {
      debug('LocationinfoService: ' + error);
    }
    return 'US';
  }
}
