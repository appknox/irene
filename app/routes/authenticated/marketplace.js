import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../mixins/scroll-top';
import ENV from 'irene/config/environment';

export default class AuthenticatedMarketPlaceRoute extends ScrollTopMixin(Route) {
  beforeModel(){
    if(!ENV.enableMarketplace){
      this.transitionTo('/');
    }
  }
}
