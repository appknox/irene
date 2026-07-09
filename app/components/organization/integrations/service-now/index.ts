import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type UserModel from 'irene/models/user';
import type { AjaxError } from 'irene/services/ajax';

interface SNCheckResponse {
  instance_url: string;
  username: string;
  /** True only after Step 2 is fully completed. */
  is_complete: boolean;
}

export type SNColumn = { label: string; value: string; type: string };

export type AppknoxSourceKey = { label: string; value: string };

const DETAIL_ROUTE =
  'authenticated.dashboard.organization-settings.service-now';

export interface OrganizationIntegrationsServiceNowSignature {
  Args: { user: UserModel };
}

export default class OrganizationIntegrationsServiceNowComponent extends Component<OrganizationIntegrationsServiceNowSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  @tracked isServiceNowIntegrated = false;

  constructor(
    owner: unknown,
    args: OrganizationIntegrationsServiceNowSignature['Args']
  ) {
    super(owner, args);
    this.checkIntegration.perform();
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateServiceNow'],
    ].join('/');
  }

  get isLoadingData() {
    return this.checkIntegration.isRunning;
  }

  get data() {
    return {
      id: 'ServiceNow',
      title: this.intl.t('serviceNow.newTitle'),
      description: this.intl.t('serviceNowIntegrationDesc'),
      logo: '../../../images/service-now.png',
      isIntegrated: this.isServiceNowIntegrated,
    };
  }

  @action navigateToPage() {
    this.router.transitionTo(DETAIL_ROUTE);
  }

  checkIntegration = task(async () => {
    /** Check whether a complete ServiceNow integration exists for this organisation. */
    try {
      const data = await this.ajax.request<SNCheckResponse>(this.baseURL);
      this.isServiceNowIntegrated = !!(
        data.instance_url &&
        data.username &&
        data.is_complete
      );
    } catch (err) {
      const error = err as AjaxError;
      if (error.status === 404) {
        this.isServiceNowIntegrated = false;
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::ServiceNow': typeof OrganizationIntegrationsServiceNowComponent;
  }
}
