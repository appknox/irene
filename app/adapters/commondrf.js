import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';
import { DRFAuthenticationBase } from './auth-base';

export default class CommonDRFAdapter extends DRFAuthenticationBase {
  host = ENV.host;
  namespace = ENV.namespace;
  namespace_v2 = ENV.namespace_v2;
  namespace_v3 = ENV.namespace_v3;
  addTrailingSlashes = false;

  @service organization;

  buildURLFromBase(resource_url) {
    const hostURLstr = this.host;
    try {
      const hostURL = new URL(hostURLstr);

      return new URL(resource_url, hostURL).href;
    } catch (e) {
      if (hostURLstr === '/' || hostURLstr === '') {
        if (resource_url[0] !== '/') {
          return '/' + resource_url;
        }

        return resource_url;
      }

      throw e;
    }
  }
}
