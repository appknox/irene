import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import { VULNERABILITY_SLA_SEVERITIES } from 'irene/utils/vulnerability-sla';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type FileModel from 'irene/models/file';
import type {
  OrganizationVulnerabilitySlaResponse,
  ProfileSlaPolicy,
  VulnerabilitySlaPolicy,
} from 'irene/utils/vulnerability-sla';

export interface OverdueVulnerabilitiesSlaPolicyDrawerPoliciesSignature {
  Args: {
    file: FileModel;
  };
}

export default class OverdueVulnerabilitiesSlaPolicyDrawerPoliciesComponent extends Component<OverdueVulnerabilitiesSlaPolicyDrawerPoliciesSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked organizationPolicy: VulnerabilitySlaPolicy | null = null;
  @tracked projectPolicy: ProfileSlaPolicy | null = null;

  constructor(
    owner: unknown,
    args: OverdueVulnerabilitiesSlaPolicyDrawerPoliciesSignature['Args']
  ) {
    super(owner, args);

    this.fetchPolicies.perform();
  }

  get organizationSlaUrl() {
    return [
      ENV.endpoints['organizations'],
      this.organization.selected?.id,
      ENV.endpoints['vulnerabilitySla'],
    ].join('/');
  }

  get organizationRows() {
    const policy = this.organizationPolicy;

    return policy
      ? VULNERABILITY_SLA_SEVERITIES.map((severity) => ({
          severity,
          slaWindow: policy[severity],
        }))
      : [];
  }

  get projectRows() {
    const policy = this.projectPolicy;

    return policy
      ? VULNERABILITY_SLA_SEVERITIES.map((severity) => ({
          severity,
          slaWindow: policy[severity],
          isOverridden: !policy[severity].is_inherited,
        }))
      : [];
  }

  fetchPolicies = task(async () => {
    try {
      const project = await this.args.file.project;

      const [organizationSla, profile] = await Promise.all([
        this.ajax.request<OrganizationVulnerabilitySlaResponse>(
          this.organizationSlaUrl
        ),
        this.store.findRecord('profile', project.activeProfileId),
      ]);

      this.organizationPolicy = organizationSla.sla_policy;
      this.projectPolicy = await profile.getSlaPolicy();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OverdueVulnerabilities::SlaPolicyDrawer::Policies': typeof OverdueVulnerabilitiesSlaPolicyDrawerPoliciesComponent;
  }
}
