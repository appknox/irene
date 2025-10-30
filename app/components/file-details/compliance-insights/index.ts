import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Owner from '@ember/owner';
import ArrayProxy from '@ember/array/proxy';

import FileModel from 'irene/models/file';
import ENUMS from 'irene/enums';
import { ECOption } from 'irene/components/ak-chart';
import OwaspModel from 'irene/models/owasp';
import OwaspMobile2024Model from 'irene/models/owaspmobile2024';
import AnalysisModel from 'irene/models/analysis';

export interface FileDetailsComplianceInsightsSignature {
  Args: {
    file: FileModel;
    fileAnalyses: AnalysisModel[];
  };
}

type OwaspChartDataOptions = { mobileOptions: ECOption; webOptions: ECOption };

export default class FileDetailsComplianceInsightsComponent extends Component<FileDetailsComplianceInsightsSignature> {
  @service declare store: Store;
  @tracked owaspTitles: Record<string, string> = {};
  @tracked owaspmobile2024s: Array<string> = [];
  @tracked owasps: Array<string> = [];

  analysisRisks = [
    ENUMS.RISK.CRITICAL,
    ENUMS.RISK.HIGH,
    ENUMS.RISK.MEDIUM,
    ENUMS.RISK.LOW,
  ];

  constructor(
    owner: Owner,
    args: FileDetailsComplianceInsightsSignature['Args']
  ) {
    super(owner, args);

    this.loadOwaspData.perform();
  }

  get analyses() {
    return this.args.fileAnalyses;
  }

  get tooltipLabels(): Record<string, string> {
    return this.owaspTitles;
  }

  get owaspData(): OwaspChartDataOptions {
    // { A1: 0, A2: 0, ... }
    const owaspACounts = Array.from(Array(10)).reduce(
      (acc, _, idx) => ({ ...acc, [`A${idx + 1}`]: 0 }),
      {}
    ) as Record<string, number>;

    // { M1: 0, M2: 0, ... }
    const owaspMCounts = Array.from(Array(10)).reduce(
      (acc, _, idx) => ({ ...acc, [`M${idx + 1}`]: 0 }),
      {}
    ) as Record<string, number>;

    // Iterate through owaspmobile2024s if available
    if (this.owaspmobile2024s.length > 0) {
      this.owaspmobile2024s.forEach((owaspmobile2024) => {
        const [key] = owaspmobile2024.split('_');

        if (key && typeof owaspACounts[key] !== 'undefined') {
          owaspACounts[key]++;
        }

        if (key && typeof owaspMCounts[key] !== 'undefined') {
          owaspMCounts[key]++;
        }
      });
    } else {
      // Iterate through owasps if owaspmobile2024s is empty
      this.owasps.forEach((owasp) => {
        const [key] = owasp.split('_');

        if (key && typeof owaspACounts[key] !== 'undefined') {
          owaspACounts[key]++;
        }

        if (key && typeof owaspMCounts[key] !== 'undefined') {
          owaspMCounts[key]++;
        }
      });
    }

    return {
      mobileOptions: this.createChartOptions(owaspMCounts),
      webOptions: this.createChartOptions(owaspACounts),
    };
  }

  loadAllOwaspData = task(async () => {
    const owaspsIds: string[] = [];
    const owaspmobile2024s: string[] = [];

    for (const analysis of this.analyses) {
      const analysisRisk = analysis?.get('risk');

      const owasp2024 = await analysis?.get('owaspmobile2024');
      const owasps = await analysis?.get('owasp');

      if (this.analysisRisks.includes(analysisRisk as number)) {
        owasp2024?.map((it) => owaspmobile2024s.push(it.id));
        owasps?.map((it) => owaspsIds.push(it.id));
      }
    }

    this.owaspmobile2024s = owaspmobile2024s;
    this.owasps = owaspsIds;
  });

  loadOwaspData = task(async () => {
    await this.loadAllOwaspData.perform();

    let data: ArrayProxy<OwaspMobile2024Model | OwaspModel> | undefined;

    const hasOwaspMobile2024s = this.owaspmobile2024s.length > 0;
    const hasOwasps = this.owasps.length > 0;

    if (hasOwaspMobile2024s) {
      data = await this.store.findAll('owaspmobile2024');
    } else if (!hasOwaspMobile2024s && hasOwasps) {
      data = await this.store.findAll('owasp');
    }

    const tooltipLabels: { [key: string]: string } = {};

    if (data) {
      data.forEach((item) => {
        const label = item.code.split(':')[0];

        if (label) {
          tooltipLabels[label] = item.title;
        }
      });
    }

    this.owaspTitles = tooltipLabels;
  });

  createChartOptions(dataset: Record<string, number>): ECOption {
    return {
      grid: {
        top: 5,
        bottom: 20,
      },
      tooltip: {
        show: true,
        formatter: (params: any) => {
          const label: string =
            this.tooltipLabels[
              params.name as keyof typeof this.tooltipLabels
            ] || 'unknown';

          return `${label} <br/> ${params.name}: ${params.value}`;
        },
      },
      xAxis: {
        type: 'category',
        data: Object.keys(dataset),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: Object.values(dataset),
          type: 'bar',
        },
      ],
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ComplianceInsights': typeof FileDetailsComplianceInsightsComponent;
    'file-details/compliance-insights': typeof FileDetailsComplianceInsightsComponent;
  }
}
