import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

export default Route.extend(ScrollTopMixin, {
  title: `Developer Settings${config.platform}`
});
