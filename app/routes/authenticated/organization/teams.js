import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';
import { inject as service } from '@ember/service';

export default Route.extend(ScrollTopMixin, {
  me: service(),

  title: `Teams${config.platform}`,
});
