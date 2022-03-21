/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class Subscription extends commondrf {

  _buildURL(modelName, id) {
    const baseurl = this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/subscriptions`);
    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
    return baseurl;
  }
}
