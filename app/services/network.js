import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';

import fetch from 'fetch';

export default class NetworkService extends Service {
  host = ENV.host
  namespace = ENV.namespace;
  @service session;
  @service buildurl;

  headers() {
    const head_values =  {
      'X-Product': 'irene-' + ENV.Version
    };
    const token = this.session.data.authenticated.b64token;
    if(token) {
      head_values['Authorization'] = "Basic " + token;
    }
    return head_values;
  }

  mergeOptions(options={}) {
    const fetch_headers = this.headers();
    options.headers ||= {};
    options.headers = Object.assign({}, options.headers, fetch_headers);
    return options;
  }

  fetch(url, options={}) {
    const buildURL = this.buildurl.build(url, this.mergeOptions(options));
    return fetch(buildURL, options);
  }
}
