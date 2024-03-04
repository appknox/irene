import Component from '@glimmer/component';
import FileModel from 'irene/models/file';
import ENUMS from 'irene/enums';
import { ECOption } from 'irene/components/ak-chart';

export interface FileDetailsComplianceInsightsSignature {
  Args: {
    file: FileModel;
  };
}

type OwaspChartDataOptions = { mobileOptions: ECOption; webOptions: ECOption };

export default class FileDetailsComplianceInsightsComponent extends Component<FileDetailsComplianceInsightsSignature> {
  get analyses() {
    return this.args.file.analyses;
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

    this.owaspmobile2024s.forEach((owaspmobile2024) => {
      const [key] = owaspmobile2024.split('_');

      if (key && typeof owaspACounts[key] !== 'undefined') {
        owaspACounts[key]++;
      }

      if (key && typeof owaspMCounts[key] !== 'undefined') {
        owaspMCounts[key]++;
      }
    });

    return {
      mobileOptions: this.createChartOptions(owaspMCounts),
      webOptions: this.createChartOptions(owaspACounts),
    };
  }

  get tooltipLabels() {
    return {
      A1: 'Injection',
      A2: 'Broken Authentication and Session Management',
      A3: 'Cross Site Scripting',
      A4: 'IDOR',
      A5: 'Security Misconfiguration',
      A6: 'Sensitive Data Exposure',
      A7: 'Missing function ACL',
      A8: 'CSRF',
      A9: 'Using components with known vulnerabilities',
      A10: 'Unvalidated Redirects and Forwards',
      M1: 'Improper Platform Usage',
      M2: 'Insecure Data Storage',
      M3: 'Insecure Communication',
      M4: 'Insecure Authentication',
      M5: 'Insufficient Cryptography',
      M6: 'Insecure Authorization',
      M7: 'Client Code Quality',
      M8: 'Code Tampering',
      M9: 'Reverse Engineering',
      M10: 'Extraneous Functionality',
    };
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
            this.tooltipLabels[params.name as keyof typeof this.tooltipLabels];

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
