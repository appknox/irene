import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedChooseRoute = Route.extend(ScrollTopMixin, {

  title: `Choose File${config.platform}`,
  model(params){
    return this.get('store').find('file', params.fileid);
  }
}
);


export default AuthenticatedChooseRoute;
