import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';
import ENV from 'irene/config/environment';

const AuthenticatedMarketPlaceRoute = Route.extend(ScrollTopMixin, {
  title: `Marketplace${config.platform}`,
  beforeModel(){
    if(!ENV.enableMarketplace){
      this.transitionTo('/');
    }
  }
});

export default AuthenticatedMarketPlaceRoute;
