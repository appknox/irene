import commondrf from './commondrf';

export default class AmAppAdapter extends commondrf {
  buildURL(modelName, id) {
    const baseurl = `${this.namespace_v2}/am_apps`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }
}
