import commondrf from './commondrf';

export default class DevicePreference extends commondrf {
  urlForQueryRecord(q) {
    const url = `${this.get('namespace')}/profiles/${q.id}/device_preference`;
    return this.buildURLFromBase(url);
  }
}
