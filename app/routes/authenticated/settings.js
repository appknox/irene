/* eslint-disable ember/no-mixins, prettier/prettier */
import { ScrollTopMixin } from '../../mixins/scroll-top';
import Route from '@ember/routing/route';

export default class AuthenticatedProjectsRoute extends ScrollTopMixin(Route) {

  model() {
    return this.modelFor("authenticated");
  }

  redirect(model, transition){
    const currentRoute = transition.targetName;
    if(currentRoute === "authenticated.settings.index") {
        this.transitionTo('/settings/general');
    }
  }
}
