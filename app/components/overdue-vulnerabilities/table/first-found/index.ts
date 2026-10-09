import Component from '@glimmer/component';
import dayjs from 'dayjs';

import type ProjectOverdueVulnerabilityModel from 'irene/models/project-overdue-vulnerability';

export interface OverdueVulnerabilitiesTableFirstFoundSignature {
  Args: { overdueVulnerability: ProjectOverdueVulnerabilityModel };
}

export default class OverdueVulnerabilitiesTableFirstFoundComponent extends Component<OverdueVulnerabilitiesTableFirstFoundSignature> {
  get firstFoundOn() {
    const { firstFoundOn } = this.args.overdueVulnerability;

    return firstFoundOn ? dayjs(firstFoundOn).format('MMM DD, YYYY') : '-';
  }

  get fileId() {
    return String(this.args.overdueVulnerability.fileId);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OverdueVulnerabilities::Table::FirstFound': typeof OverdueVulnerabilitiesTableFirstFoundComponent;
    'overdue-vulnerabilities/table/first-found': typeof OverdueVulnerabilitiesTableFirstFoundComponent;
  }
}
