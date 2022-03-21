/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class DynamicscanModeAdapter extends commondrf {
  urlForQueryRecord(q) {
    const url = `${this.get('namespace')}/profiles/${q.id}/dynamicscan_mode`;
    return this.buildURLFromBase(url);
  }
}
