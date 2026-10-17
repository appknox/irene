import Component from '@glimmer/component';

import type ProjectOverdueVulnerabilityModel from 'irene/models/project-overdue-vulnerability';

export interface OverdueVulnerabilitiesTableSeveritySignature {
  Args: { overdueVulnerability: ProjectOverdueVulnerabilityModel };
}

export default class OverdueVulnerabilitiesTableSeverityComponent extends Component<OverdueVulnerabilitiesTableSeveritySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OverdueVulnerabilities::Table::Severity': typeof OverdueVulnerabilitiesTableSeverityComponent;
    'overdue-vulnerabilities/table/severity': typeof OverdueVulnerabilitiesTableSeverityComponent;
  }
}
