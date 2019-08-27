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
  _buildURL: function (modelName, id) {
    if(id) {
      const baseurl = `${this.get('host')}/${this.get('namespace_v2')}/projects`;
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
    return `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/projects`;
  },
});
