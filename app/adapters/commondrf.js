import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';
import { inject as service } from '@ember/service';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  namespace_v2: ENV.namespace_v2,
  addTrailingSlashes: false,
  organization: service('organization'),
  buildURLFromBase: function(resource_url) {
    const hostURLstr = this.get('host');
    try {
      const hostURL = new URL(hostURLstr);
      return new URL(resource_url, hostURL).href;
    } catch(e){
      if(hostURLstr === '/' || hostURLstr === "") {
        if (resource_url[0] !== "/") {
          return "/" + resource_url;
        }
        return resource_url;
      }
      throw e;
    }
  }
});
