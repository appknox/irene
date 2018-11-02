import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedProjectSettingsRoute = Route.extend(ScrollTopMixin, {
  title: `Project Setting${config.platform}`,
  model: function(){
    return this.modelFor("authenticated.project");
  }
});


export default AuthenticatedProjectSettingsRoute;
