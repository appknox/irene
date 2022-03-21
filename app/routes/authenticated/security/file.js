/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import Route from '@ember/routing/route';

export default class AuthenticatedSecurityFileRoute extends Route {
  async model(params){
    await this.get('store').findAll('Vulnerability');
    return this.get('store').findRecord('security/file', params.fileid);
  }
}
