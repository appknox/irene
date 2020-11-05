import commondrf from '../commondrf';

export default class analysis extends commondrf {


  _buildURL(modelName, id) {
    if (id) {
      return this.buildURLFromBase(`${this.get('namespace')}/analyses/${id}`);
    } else {
      return this.buildURLFromBase(`${this.get('namespace')}/analyses`);
    }
  }
}
