import commondrf from './commondrf';

export default class Tag extends commondrf {

  _buildURL(modelName, id) {
    const baseurl = this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/tags`);
    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
    return baseurl;
  }
}
