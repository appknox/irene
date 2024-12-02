import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type Controller from '@ember/controller';
import type Transition from '@ember/routing/transition';
import type RouterService from '@ember/routing/router-service';
import type AkBreadcrumbsService from 'irene/services/ak-breadcrumbs';

export default class AkBreadcrumbsRoute extends Route {
  @service declare router: RouterService;
  @service('ak-breadcrumbs') declare bCS: AkBreadcrumbsService;

  setupController(
    controller: Controller,
    model: unknown,
    transition: Transition
  ) {
    super.setupController(controller, model, transition);

    this.bCS.generateBreadcrumbItems(
      this.router.currentRoute,
      this,
      transition.from
    );
  }
}
