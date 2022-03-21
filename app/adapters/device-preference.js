/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class DevicePreference extends commondrf {
  urlForQueryRecord(q) {
    const url = `${this.get('namespace')}/profiles/${q.id}/device_preference`;
    return this.buildURLFromBase(url);
  }
}
