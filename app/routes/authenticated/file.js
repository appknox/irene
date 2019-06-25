import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedFileRoute = Route.extend(ScrollTopMixin, {

  title: `File Details${config.platform}`,
  async model(params){
    return this.get('store').findRecord('file', params.fileid, { reload: true });
  },
  afterModel(model, transition){
    if (transition.targetName==='authenticated.file.index'){
      this.transitionTo('authenticated.file.overview');
    }
  }
}
);

export default AuthenticatedFileRoute;
