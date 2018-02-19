import Ember from 'ember';


const AuthenticatedProjectRoute = Ember.Route.extend({

  model(params){
    return this.store.findRecord("project", params.projectId);
  }
});

export default AuthenticatedProjectRoute;
