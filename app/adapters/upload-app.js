/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';
import { underscore } from '@ember/string';

export default class UploadApp extends commondrf {

  pathForType(type) {
    return underscore(type);
  }
  urlForQueryRecord(query, modelName) {
    return this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/${this.pathForType(modelName)}`);
  }
  urlForUpdateRecord(id, modelName) {
    return this.urlForQueryRecord(null, modelName);
  }
  updateRecord(store, type, snapshot) {
    let data = {};
    let serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot);

    let id = snapshot.id;
    let url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, "POST", {
      data: data
    });
  }
}
