import commondrf from './commondrf';

export default class AmAppVersionAdapter extends commondrf {
  buildURL(modelName, id) {
    const baseurl = `${this.namespace_v2}/am_app_versions`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }
}
