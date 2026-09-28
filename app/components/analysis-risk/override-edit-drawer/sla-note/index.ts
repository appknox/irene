import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type { OrganizationVulnerabilitySlaResponse } from 'irene/utils/vulnerability-sla';

export default class AnalysisRiskOverrideEditDrawerSlaNoteComponent extends Component {
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;

  @tracked isSlaEnabled = false;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchSla.perform();
  }

  get organizationSlaUrl() {
    return [
      ENV.endpoints['organizations'],
      this.organization.selected?.id,
      ENV.endpoints['vulnerabilitySla'],
    ].join('/');
  }

  fetchSla = task(async () => {
    if (!this.organization.selected) {
      return;
    }

    try {
      const sla = await this.ajax.request<OrganizationVulnerabilitySlaResponse>(
        this.organizationSlaUrl
      );

      this.isSlaEnabled = sla.enabled;
    } catch {
      // The note is informational; without the SLA state it stays hidden
      this.isSlaEnabled = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer::SlaNote': typeof AnalysisRiskOverrideEditDrawerSlaNoteComponent;
  }
}
