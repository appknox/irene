import Component from '@glimmer/component';
import dayjs from 'dayjs';

import type ProjectOverdueVulnerabilityModel from 'irene/models/project-overdue-vulnerability';

export interface OverdueVulnerabilitiesTableOverdueBySignature {
  Args: { overdueVulnerability: ProjectOverdueVulnerabilityModel };
}

export default class OverdueVulnerabilitiesTableOverdueByComponent extends Component<OverdueVulnerabilitiesTableOverdueBySignature> {
  get overdueDays() {
    return Math.max(
      dayjs().diff(this.args.overdueVulnerability.remediationDeadline, 'day'),
      0
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OverdueVulnerabilities::Table::OverdueBy': typeof OverdueVulnerabilitiesTableOverdueByComponent;
    'overdue-vulnerabilities/table/overdue-by': typeof OverdueVulnerabilitiesTableOverdueByComponent;
  }
}
