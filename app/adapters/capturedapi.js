/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class CapturedAPI extends commondrf {
  buildURL(modelName, id, snapshot, requestType, query) {
    if (id){
      const baseurl = `${this.get('namespace')}/capturedapis`;
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    const baseurl = `${this.get('namespace_v2')}/files/${query.fileId}`;
    return this.buildURLFromBase(`${baseurl}/capturedapis`);
  }
}
