import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type { EmberTableSort } from 'ember-table';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENUMS from 'irene/enums';
import type ProjectOverdueVulnerabilityModel from 'irene/models/project-overdue-vulnerability';

export interface OverdueVulnerabilitiesTableSignature {
  Args: {
    loading?: boolean;
    rows?: ProjectOverdueVulnerabilityModel[];
    ordering?: string;
    onOrderingChange?: (ordering: string) => void;
  };
}

// Table sort value paths and the API `ordering` they map to
const SORT_FIELD_BY_VALUE_PATH: Record<string, string> = {
  computedRisk: 'severity',
  remediationDeadline: 'overdue_by',
};

export default class OverdueVulnerabilitiesTableComponent extends Component<OverdueVulnerabilitiesTableSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('browser/window') declare window: Window;

  get columns() {
    return [
      {
        name: this.intl.t('overdueVulnerabilities.nameOfVulnerability'),
        valuePath: 'vulnerabilityName',
        isSortable: false,
        width: 250,
      },
      {
        name: this.intl.t('severity'),
        valuePath: 'computedRisk',
        component: 'overdue-vulnerabilities/table/severity',
        textAlign: 'center',
      },
      {
        name: this.intl.t('overdueVulnerabilities.overdueBy'),
        valuePath: 'remediationDeadline',
        component: 'overdue-vulnerabilities/table/overdue-by',
        textAlign: 'center',
      },
      {
        name: this.intl.t('overdueVulnerabilities.firstFoundOn'),
        component: 'overdue-vulnerabilities/table/first-found',
        isSortable: false,
        width: 200,
      },
    ];
  }

  get sorts(): EmberTableSort[] {
    const ordering = this.args.ordering ?? '';
    const field = ordering.replace(/^-/, '');

    const valuePath = Object.keys(SORT_FIELD_BY_VALUE_PATH).find(
      (key) => SORT_FIELD_BY_VALUE_PATH[key] === field
    );

    return valuePath
      ? [{ valuePath, isAscending: !ordering.startsWith('-') }]
      : [];
  }

  routeFor(row: ProjectOverdueVulnerabilityModel) {
    const isKnoxiqAnalysed =
      (row.exploitabilityLikelihood != null &&
        row.exploitabilityLikelihood !==
          ENUMS.KNOXIQ_EXPLOITABILITY.EXP_UNKNOWN) ||
      row.isKnoxiqAllFp;

    return isKnoxiqAnalysed
      ? 'authenticated.dashboard.file.knox-analysis'
      : 'authenticated.dashboard.file.analysis';
  }

  @action
  handleSortsUpdate(sorts: EmberTableSort[]) {
    const current = this.sorts[0];

    // ember-table clears the sort on a third click; flip the direction instead
    const sort = sorts[0] ?? {
      valuePath: current?.valuePath,
      isAscending: !current?.isAscending,
    };

    const field = sort.valuePath
      ? SORT_FIELD_BY_VALUE_PATH[sort.valuePath]
      : undefined;

    if (field) {
      this.args.onOrderingChange?.(sort.isAscending ? field : `-${field}`);
    }
  }

  @action
  handleRowClick({
    rowValue,
    event,
  }: {
    rowValue: ProjectOverdueVulnerabilityModel;
    event: MouseEvent;
  }) {
    // The file link inside the row navigates on its own
    if ((event.target as HTMLElement).closest('a') || !rowValue.analysisId) {
      return;
    }

    const routeName = this.routeFor(rowValue);
    const fileId = String(rowValue.fileId);
    const analysisId = String(rowValue.analysisId);

    if (event.ctrlKey || event.metaKey) {
      const url = this.router.urlFor(routeName, fileId, analysisId);

      this.window.open(url, '_blank');
    } else {
      this.router.transitionTo(routeName, fileId, analysisId);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OverdueVulnerabilities::Table': typeof OverdueVulnerabilitiesTableComponent;
  }
}
