import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fetch from 'fetch';
import BuildURL from './buildurl';

type Header = { [x: string]: string };

type RequestOptions = {
  method?: string;
  body?: string;
  headers?: Header;
};

export default class NetworkService extends Service {
  host = ENV.host;
  namespace = ENV.namespace;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare session: any;
  @service declare buildurl: BuildURL;

  headers() {
    const head_values: Header = {
      'X-Product': 'irene-' + ENV.APP.version,
    };

    const token = this.session.data.authenticated.b64token;

    if (token) {
      head_values['Authorization'] = 'Basic ' + token;
    }

    return head_values;
  }

  mergeOptions(options: RequestOptions = {}) {
    const fetch_headers = this.headers();

    options.headers ||= {};
    options.headers = Object.assign({}, options.headers, fetch_headers);

    return options;
  }

  fetch(url: string, options: RequestOptions = {}) {
    const buildURL = this.buildurl.build(url, this.mergeOptions(options));
    return fetch(buildURL, options);
  }

  request(url: string, reqOptions: RequestOptions = {}) {
    if (!reqOptions.method) {
      reqOptions.method = 'GET';
    }

    if (!reqOptions.headers) {
      reqOptions.headers = {};
    }

    if (reqOptions.body && reqOptions.method !== 'GET') {
      if (
        !reqOptions.headers['Content-Type'] &&
        !reqOptions.headers['content-type']
      ) {
        reqOptions.headers['content-type'] = 'application/json';
      }
    }

    return this.fetch(url, reqOptions);
  }

  post(url: string, body: object = {}, reqOptions: RequestOptions = {}) {
    const post_options = {
      method: 'POST',
      body: JSON.stringify(body),
    };

    const options = Object.assign({}, reqOptions, post_options);

    return this.request(url, options);
  }
}
