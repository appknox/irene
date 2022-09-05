/* eslint-disable ember/no-mixins, prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../mixins/scroll-top';

export default class AuthenticatedFileRoute extends ScrollTopMixin(Route) {
  async model(params) {
    return this.get('store').find('file', params.fileid);
  }
}
