import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const {inject: {service}} = Ember;

const IndexRoute = Ember.Route.extend(ScrollTopMixin, {

  session: service(),

  title: `Home${config.platform}`,
  model() {
    const userId = this.get("session.data.authenticated.user_id");
    return this.get('store').find('user', userId);
  },
}
);

export default IndexRoute;
