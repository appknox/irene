import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import { inject as service } from '@ember/service';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const IndexRoute = Route.extend(ScrollTopMixin, {

  session: service(),

  title: `Home${config.platform}`,

  model() {
    this.modelFor("authenticated");
  }
}
);

export default IndexRoute;
