/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class AutomationScriptAdapter extends commondrf {
  _buildURL(modelName, id) {
    const baseURL = `${this.get('namespace')}/profiles`;
    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(modelName, profileId) {
    const profileURL = this._buildURL(modelName, profileId);
    const automationScriptsURL = [profileURL, 'automation_scripts'].join('/');
    return automationScriptsURL;
  }

  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.profileId);
  }
}
