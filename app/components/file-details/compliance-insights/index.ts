import Component from '@glimmer/component';
import FileModel from 'irene/models/file';
import ENUMS from 'irene/enums';
import { ECOption } from 'irene/components/ak-chart';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import OwaspMobile2024Model from 'irene/models/owaspmobile2024';
import OwaspModel from 'irene/models/owasp';

export interface FileDetailsComplianceInsightsSignature {
  Args: {
    file: FileModel;
  };
}

type OwaspChartDataOptions = { mobileOptions: ECOption; webOptions: ECOption };

export default class FileDetailsComplianceInsightsComponent extends Component<FileDetailsComplianceInsightsSignature> {
  @service declare store: Store;
  @tracked owaspTitles: { [key: string]: string } = {};

  get analyses() {
    return this.args.file.analyses;
  }

  get owasps() {
    const owasps: string[] = [];

    const risks = [
      ENUMS.RISK.CRITICAL,
      ENUMS.RISK.HIGH,
      ENUMS.RISK.MEDIUM,
      ENUMS.RISK.LOW,
    ];

    this.analyses.forEach((analysis) => {
      analysis.owasp.forEach((owasp) => {
        if (risks.includes(analysis.get('risk'))) {
          owasps.push(owasp.id);
        }
      });
    });

    return owasps;
  }

  get owaspmobile2024s() {
    const owaspmobile2024s: string[] = [];

    const risks = [
      ENUMS.RISK.CRITICAL,
      ENUMS.RISK.HIGH,
      ENUMS.RISK.MEDIUM,
      ENUMS.RISK.LOW,
    ];

    this.analyses.forEach((analysis) => {
      analysis.owaspmobile2024.forEach((owaspmobile2024) => {
        if (risks.includes(analysis.get('risk'))) {
          owaspmobile2024s.push(owaspmobile2024.id);
        }
      });
    });

    return owaspmobile2024s;
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

    this.loadData.perform();

    return {
      mobileOptions: this.createChartOptions(owaspMCounts),
      webOptions: this.createChartOptions(owaspACounts),
    };
  }

  loadData = task(async () => {
    let data: (OwaspMobile2024Model | OwaspModel)[] | undefined = undefined;

    if (this.owaspmobile2024s.length > 0) {
      const owaspmobile2024Data = await this.store.findAll('owaspmobile2024');
      data = owaspmobile2024Data.toArray();
    } else if (this.owaspmobile2024s.length === 0 && this.owasps.length > 0) {
      const owaspData = await this.store.findAll('owasp');
      data = owaspData.toArray();
    }

    const tooltipLabels: { [key: string]: string } = {};

    if (data) {
      data.forEach((item: { code: string; title: string }) => {
        const key = item.code.split(':')[0] as keyof typeof tooltipLabels;
        tooltipLabels[key] = item.title;
      });
    }

    this.owaspTitles = tooltipLabels;
  });

  get tooltipLabels(): { [key: string]: string } {
    return this.owaspTitles;
  }

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
