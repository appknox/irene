import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import AjaxService from 'ember-ajax/services/ajax';
import ENV from 'irene/config/environment';


// https://github.com/ember-cli/ember-ajax/blob/c178c5e28a316a23cd1da5736c0e29621d838cb1/addon/-private/utils/url-helpers.ts#L55
const completeUrlRegex = /^(http|https)/;

function isFullURL(url) {
  return !!url.match(completeUrlRegex);
}

export default class IreneAjaxService extends AjaxService {
  host = ENV.host;
  namespace = ENV.namespace;
  @service session;
  _buildURL(url, options) {
    const ret = super._buildURL(url, options);
    if(isFullURL(ret)) {
      return ret;
    }
    if(ret.length && ret[0] !== '/') {
      return '/' + ret;
    }
    return ret;
  }
  @computed('session.data.authenticated.b64token', function () {
    const token = this.session.data.authenticated.b64token;
    if(token) {
      return {
        'Authorization': "Basic " + token,
        'X-Product': ENV.product
      };
    }
    return {
      'X-Product': ENV.product
    };
  })
  headers;
}
