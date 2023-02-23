import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import OrganizationService from '../../services/organization';
import AppMonitoringService from '../../services/appmonitoring';
import AMConfigurationModel from '../../models/amconfiguration';
import Controller from '@ember/controller';
import Transition from '@ember/routing/transition';

interface QueryParams {
  app_limit: number;
  app_offset: number;
}

export interface AppMonitoringRouteModel {
  settings: AMConfigurationModel | undefined;
}

export default class AuthenticatedAppMonitoringRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare appmonitoring: AppMonitoringService;

  queryParams = {
    app_limit: {
      refreshModel: true,
    },
    app_offset: {
      refreshModel: true,
    },
  };

  beforeModel() {
    if (!this.organization.selected?.features.app_monitoring) {
      this.transitionTo('authenticated.projects');
    }
  }

  async model(q: QueryParams): Promise<AppMonitoringRouteModel> {
    const { app_limit, app_offset } = q;

    await this.appmonitoring
      .setLimitOffset({
        limit: app_limit,
        offset: app_offset,
      })
      .reload();

    const orgModel = this.organization.selected;
    const AmSettings = await orgModel?.get_am_configuration();

    return {
      settings: AmSettings,
    };
  }

  setupController(
    controller: Controller,
    model: AppMonitoringRouteModel,
    transition: Transition
  ): void {
    super.setupController(controller, model, transition);
  }
}
