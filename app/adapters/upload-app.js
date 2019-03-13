import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import { underscore } from '@ember/string';
import { inject as service } from '@ember/service';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  organization: service('organization'),
  pathForType: function(type) {
    return underscore(type);
  },
  urlForQueryRecord(query, modelName) {
    return `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/${this.pathForType(modelName)}`;
  },
  urlForUpdateRecord(id, modelName){
    return this.urlForQueryRecord(null, modelName);
  },
  updateRecord(store, type, snapshot) {
    let data = {};
    let serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot);

    let id = snapshot.id;
    let url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, "POST", { data: data });
  },
});
