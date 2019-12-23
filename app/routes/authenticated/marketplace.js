import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedMarketPlaceRoute = Route.extend(ScrollTopMixin, {
  title: `Marketplace${config.platform}`,
});

export default AuthenticatedMarketPlaceRoute;
