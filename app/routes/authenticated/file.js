import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedFileRoute = Ember.Route.extend(ScrollTopMixin, {

  title: `File Details${config.platform}`,
  async model(params){
    await this.get('store').findAll('Vulnerability');
    return this.get('store').find('file', params.fileId);
  }
}
);

export default AuthenticatedFileRoute;
