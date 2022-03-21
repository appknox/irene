/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods, prettier/prettier */
import commondrf from './commondrf';

export default class OrganizationArchive extends commondrf {
  _buildURL(moduleName, id) {
    const baseurl = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/archives`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }

  getDownloadURL(id) {
    const archiveIdBaseURL = this._buildURL(null, id);
    const downloadURL = `${archiveIdBaseURL}/download_url`;
    return this.ajax(downloadURL);
  }
}
