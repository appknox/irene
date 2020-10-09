import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';
import { inject as service } from '@ember/service';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  organization: service('organization'),
  _buildURL: function(modelName, id) {
    console.log('check')
    const baseurl = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/cleanups`;
    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
    return baseurl;
  },

  _triggerCleanup(snapshot) {
    const id = snapshot.id;
    const modelName = snapshot.constructor.modelName;
    const url = this.buildURL(modelName, id)
    return this.ajax(url, 'POST', {
      data: {}
    })
  }
});
