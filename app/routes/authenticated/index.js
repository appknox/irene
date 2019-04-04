import Route from '@ember/routing/route';

const IndexRoute = Route.extend({

  beforeModel() {
    this.transitionTo('/projects');
  }
}
);

export default IndexRoute;
