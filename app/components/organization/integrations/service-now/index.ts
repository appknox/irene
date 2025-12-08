import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import type { BufferedChangeset } from 'ember-changeset/types';
import type IntlService from 'ember-intl/services/intl';

import serviceNowValidation from './validator';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type UserModel from 'irene/models/user';
import type AnalyticsService from 'irene/services/analytics';
import type { AjaxError } from 'irene/services/ajax';

type ServiceNowIntegrationFields = {
  username: string;
  password: string;
  instanceURL: string;
};

type ChangesetBufferProps = BufferedChangeset &
  ServiceNowIntegrationFields & {
    error: { [key in keyof ServiceNowIntegrationFields]: boolean };
  };

type SNTableItem = {
  label: string;
  value: number;
};

interface ServiceNowCheckResponse {
  id: number;
  instance_url: string;
  username: string;
  table_name: string;
  created_on: Date;
  updated_on: Date;
}

export interface OrganizationIntegrationsServiceNowSignature {
  Args: {
    user: UserModel;
  };
}

export default class OrganizationIntegrationsServiceNowComponent extends Component<OrganizationIntegrationsServiceNowSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  tPleaseTryAgain: string;
  tServiceNowIntegrated: string;
  tServiceNowWillBeRevoked: string;
  changeset: ChangesetBufferProps;

  @tracked snInstanceURL = '';
  @tracked snUsername = '';
  @tracked snPassword = '';
  @tracked selectedSNTable: SNTableItem | null = null;
  @tracked serviceNowPOJO: Record<string, unknown> = {};

  @tracked isServiceNowIntegrated = false;
  @tracked showRevokeServiceNowConfirmBox = false;
  @tracked integrationDrawerIsOpen = false;

  constructor(
    owner: unknown,
    args: OrganizationIntegrationsServiceNowSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.tServiceNowIntegrated = this.intl.t('serviceNowIntegrated');
    this.tServiceNowWillBeRevoked = this.intl.t('serviceNow.willBeRevoked');

    const serviceNowPOJO = this.serviceNowPOJO;

    this.changeset = Changeset(
      serviceNowPOJO,
      lookupValidator(serviceNowValidation),
      serviceNowValidation
    ) as ChangesetBufferProps;

    this.checkServiceNowIntegration.perform();
  }

  get data() {
    return {
      id: 'ServiceNow',
      title: this.intl.t('serviceNow.title'),
      description: this.intl.t('serviceNowIntegrationDesc'),
      logo: '../../../images/service-now.png',
      isIntegrated: this.isServiceNowIntegrated,
    };
  }

  get snTableItems() {
    return [
      {
        label: 'sn_vul_app_vulnerable_item',
        value: ENUMS.SERVICE_NOW_TABLE_SELECTION.SN_VUL_APP_VULNERABLE_ITEM,
      },
      {
        label: 'sn_vul_vulnerable_item',
        value: ENUMS.SERVICE_NOW_TABLE_SELECTION.SN_VUL_VULNERABLE_ITEM,
      },
    ];
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateServiceNow'],
    ].join('/');
  }

  get isLoadingSNData() {
    return this.checkServiceNowIntegration.isRunning;
  }

  get showIntegratedOrLoadingUI() {
    return this.isServiceNowIntegrated || this.isLoadingSNData;
  }

  @action
  openDrawer() {
    this.integrationDrawerIsOpen = true;
  }

  @action
  closeDrawer() {
    this.integrationDrawerIsOpen = false;
  }

  @action
  setSNTable(selection: SNTableItem) {
    this.selectedSNTable = selection;
  }

  @action
  resetSNInputs() {
    this.snInstanceURL = '';
    this.snUsername = '';
    this.snPassword = '';
    this.selectedSNTable = null;

    this.changeset.rollback();
  }

  confirmCallback() {
    this.revokeServiceNow.perform();
  }

  checkServiceNowIntegration = task(async () => {
    try {
      const data = await this.ajax.request<ServiceNowCheckResponse>(
        this.baseURL
      );

      this.isServiceNowIntegrated = !!(data.instance_url && data.username);
      this.snInstanceURL = data.instance_url;
      this.snUsername = data.username;

      const selectedSNTable = this.snTableItems.find(
        (snt) => snt.value === Number(data.table_name)
      );

      this.selectedSNTable = selectedSNTable ?? null;
    } catch (err) {
      const error = err as AjaxError;

      if (error.status === 404) {
        this.isServiceNowIntegrated = false;
      }
    }
  });

  revokeServiceNow = task(async () => {
    try {
      await this.ajax.delete(this.baseURL);

      this.isServiceNowIntegrated = false;

      this.closeRevokeServiceNowConfirmBox();
      this.checkServiceNowIntegration.perform();
      this.resetSNInputs();

      this.notify.success(this.tServiceNowWillBeRevoked);
    } catch (error) {
      this.notify.error(this.tPleaseTryAgain);
    }
  });

  integrateServiceNow = task(async (changeset) => {
    await changeset.validate();

    if (!changeset.isValid) {
      if (changeset.errors && changeset.errors[0].validation) {
        this.notify.error(changeset.errors[0].validation, ENV.notifications);
      }

      return;
    }

    const data = {
      instance_url: changeset.instanceURL.trim(),
      username: changeset.username.trim(),
      password: changeset.password,
      table_name: this.selectedSNTable?.value,
    };

    try {
      await this.ajax.post(this.baseURL, { data });

      this.checkServiceNowIntegration.perform();

      this.notify.success(this.tServiceNowIntegrated);

      this.analytics.track({
        name: 'INTEGRATION_INITIATED_EVENT',
        properties: {
          feature: 'service_now_integration_completed',
        },
      });
    } catch (err) {
      const error = err as AdapterError;
      const errorKeys = Object.keys(error.payload);
      const hasError = errorKeys.length > 0;

      // Notify first error message
      if (hasError) {
        const field = String(errorKeys?.[0]);
        const message = error.payload[field][0];

        this.notify.error(`${field} - ${message}`, ENV.notifications);
      } else {
        this.notify.error(parseError(err, this.tPleaseTryAgain));
      }
    }
  });

  @action
  openRevokeServiceNowConfirmBox() {
    this.showRevokeServiceNowConfirmBox = true;
  }

  @action
  closeRevokeServiceNowConfirmBox() {
    this.showRevokeServiceNowConfirmBox = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::ServiceNow': typeof OrganizationIntegrationsServiceNowComponent;
  }
}
