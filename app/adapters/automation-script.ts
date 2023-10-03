import commondrf from './commondrf';

export default class AutomationScriptAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string) {
    const baseURL = `${this.namespace}/profiles`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  _buildNestedURL(modelName: string | number, profileId: string) {
    const profileURL = this._buildURL(modelName, profileId);
    const automationScriptsURL = [profileURL, 'automation_scripts'].join('/');

    return automationScriptsURL;
  }

  urlForQuery<K extends string | number>(
    query: { profileId: string },
    modelName: K
  ) {
    return this._buildNestedURL(modelName, query.profileId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'automation-script': AutomationScriptAdapter;
  }
}
