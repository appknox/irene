import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationModel from 'irene/models/organization';

export interface OrganizationEditAnalysisSignature {
  Args: { organization: OrganizationModel };
}

export default class OrganizationEditAnalysisComponent extends Component<OrganizationEditAnalysisSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;

  @tracked isFeatureEnabled = false;

  constructor(owner: unknown, args: OrganizationEditAnalysisSignature['Args']) {
    super(owner, args);

    this.isFeatureEnabled = Boolean(
      args.organization?.features?.member_override_request
    );
  }

  get organization() {
    return this.args.organization;
  }

  get memberOverrideRequestFeatureUrl() {
    return [
      ENV.endpoints['organizations'],
      this.organization.id,
      ENV.endpoints['memberOverrideRequestFeature'],
    ].join('/');
  }

  setMemberOverrideRequest = task(async (_, checked: boolean) => {
    const previousValue = this.isFeatureEnabled;
    this.isFeatureEnabled = checked;

    try {
      await this.ajax.makeRequest(this.memberOverrideRequestFeatureUrl, {
        method: 'PATCH',
        data: { member_override_request: checked },
      });

      const features = {
        ...this.organization.features,
        member_override_request: checked,
      };

      this.organization.set('features', features);
      this.notify.success(this.intl.t('allowEditAnalysisForMembersChanged'));
    } catch (error) {
      this.isFeatureEnabled = previousValue;
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::EditAnalysis': typeof OrganizationEditAnalysisComponent;
  }
}
