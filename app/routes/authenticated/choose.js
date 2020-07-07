import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../mixins/scroll-top';

export default class AuthenticatedChooseRoute extends ScrollTopMixin(Route) {
  model(params){
    return this.get('store').find('file', params.fileid);
  }
}
