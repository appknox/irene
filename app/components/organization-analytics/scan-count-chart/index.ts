import Component from '@glimmer/component';
import { ECOption } from 'irene/components/ak-chart';
import { IScanCount } from '..';

export interface OrganizationAnalyticsScanCountChartSignature {
  Args: {
    scanCount: IScanCount | null;
  };
}

export default class OrganizationAnalyticsScanCountChartComponent extends Component<OrganizationAnalyticsScanCountChartSignature> {
  get option(): ECOption {
    return {
      title: {
        text: this.args.scanCount
          ? `Total App Scans: ${this.args.scanCount.total_scan_count}`
          : '',
        left: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: '1.2rem',
        },
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: '0',
        left: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '75%'],
          label: {
            show: true,
            formatter(param) {
              return `${param.name} (${param.value})`;
            },
          },
          data:
            this.args.scanCount && this.args.scanCount.total_scan_count > 0
              ? [
                  {
                    value: this.args.scanCount.total_android_scan_count,
                    name: 'Android',
                  },
                  {
                    value: this.args.scanCount.total_ios_scan_count,
                    name: 'iOS',
                  },
                ]
              : [],
        },
      ],
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationAnalytics::ScanCountChart': typeof OrganizationAnalyticsScanCountChartComponent;
  }
}
