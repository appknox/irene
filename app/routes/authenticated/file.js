/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedFileRoute = Ember.Route.extend(ScrollTopMixin, {

  title: `File Details${config.platform}`,
  model(params){
    return this.get('store').find('file', params.fileId);
  }
}
);

export default AuthenticatedFileRoute;
