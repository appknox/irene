import config from 'irene/config/environment';
import Route from '@ember/routing/route';

export default Route.extend({
  title: `File Details${config.platform}`,
  async model(params){
    await this.get('store').findAll('Vulnerability');
    return this.get('store').findRecord('security/file', params.fileid);
  }
});
