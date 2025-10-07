import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as echarts from 'echarts';
import { tracked } from '@glimmer/tracking';
import styles from './index.scss';
import FileModel from 'irene/models/file';
import { service } from '@ember/service';
import type PrivacyModuleService from 'irene/services/privacy-module';

export interface PrivacyModuleAppDetailsGeoLocationSignature {
  Args: {
    file: FileModel;
  };
}

export default class PrivacyModuleAppDetailsGeoLocationComponent extends Component<PrivacyModuleAppDetailsGeoLocationSignature> {
  chart: echarts.ECharts | null = null;

  @tracked selectedCountry: any = null;

  @service declare privacyModule: PrivacyModuleService;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppDetailsGeoLocationSignature['Args']
  ) {
    super(owner, args);

    this.privacyModule.fetchGeoLocationData.perform(this.fileId);
  }

  get fileId() {
    return this.args.file.id;
  }

  get geoLocationData() {
    return this.privacyModule.geoLocationDataList;
  }

  get isFetching() {
    return this.privacyModule.fetchGeoLocationData.isRunning;
  }

  @action
  async setupChart(element: HTMLElement): Promise<void> {
    const response = await fetch('/world.json');
    const worldGeoJSON = await response.json();

    const geoMapData = this.geoLocationData.map((d) => ({
      name: d.countryCode, // used for map
      countryName: d.countryName, // used in tooltip
      hostLength: d.hostUrls.length,
      hosts: d.hostUrls, // full host URLs if needed
      itemStyle: {
        areaColor: d.isHighRiskRegion ? '#D72F2F' : '#98CCFF',
      },
      emphasis: {
        itemStyle: {
          areaColor: d.isHighRiskRegion ? '#D72F2F' : '#98CCFF',
        },
      },
    }));

    const allowedCountries = geoMapData.map((d) => d.name);

    echarts.registerMap('world', worldGeoJSON);

    this.chart = echarts.init(element);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        enterable: true,
        className: styles['country-tooltip'],
        position: function (point) {
          const x = point[0];
          const y = point[1];
          return [x, y];
        },

        formatter: (params: any) => {
          const countryName = params?.data?.countryName;
          const name = params?.name;
          const hostUrlsLen = params?.data?.hostLength;

          if (!allowedCountries.includes(name)) {
            return '';
          }

          return `
            <div>
            <div class=${styles['tooltip-body']}>
              <div class=${styles['tooltip-country-name']}>${countryName}</div>
       
              <div class=${styles['tooltip-number-icon']}> 
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 0.25C3.04813 0.25 0.25 3.04813 0.25 6.5C0.25 9.95187 3.04813 12.75 6.5 12.75C9.95187 12.75 12.75 9.95187 12.75 6.5C12.75 3.04813 9.95187 0.25 6.5 0.25ZM10.8237 4H8.81437C8.721 3.29675 8.60322 2.59695 8.46125 1.90188C9.45362 2.32941 10.282 3.06508 10.8237 4ZM7.13375 1.545C7.17625 1.765 7.37563 2.81875 7.53688 4H5.46312C5.62437 2.81875 5.82375 1.765 5.86625 1.545C6.07438 1.51813 6.285 1.5 6.5 1.5C6.715 1.5 6.92562 1.51813 7.13375 1.545ZM7.75 6.5C7.75 6.87375 7.72312 7.30375 7.68187 7.75H5.31813C5.27688 7.30375 5.25 6.87375 5.25 6.5C5.25 6.12625 5.27688 5.69625 5.31813 5.25H7.68187C7.72312 5.69625 7.75 6.12625 7.75 6.5ZM4.53875 1.90188C4.39678 2.59695 4.279 3.29675 4.18563 4H2.17625C2.71801 3.06508 3.54638 2.32941 4.53875 1.90188ZM1.66438 5.25H4.0525C4.02062 5.6675 4 6.09 4 6.5C4 6.91 4.02063 7.3325 4.05312 7.75H1.66438C1.56062 7.34938 1.5 6.9325 1.5 6.5C1.5 6.0675 1.56125 5.65062 1.66438 5.25ZM2.17625 9H4.18563C4.30312 9.89 4.44813 10.6562 4.53875 11.0981C3.54638 10.6706 2.71801 9.93492 2.17625 9ZM5.86625 11.455C5.71074 10.6403 5.57632 9.82167 5.46312 9H7.53688C7.42341 9.82163 7.28899 10.6402 7.13375 11.455C6.92562 11.4819 6.715 11.5 6.5 11.5C6.285 11.5 6.07438 11.4819 5.86625 11.455ZM8.46125 11.0981C8.55188 10.6562 8.69687 9.89 8.81437 9H10.8237C10.282 9.93492 9.45362 10.6706 8.46125 11.0981ZM11.3356 7.75H8.9475C8.97937 7.3325 9 6.91 9 6.5C9 6.09 8.97937 5.6675 8.94687 5.25H11.335C11.4388 5.65062 11.5 6.0675 11.5 6.5C11.5 6.9325 11.4394 7.34938 11.3356 7.75Z" fill="black"/>
              </svg>

              <span class=${styles['tooltip-number']}>${hostUrlsLen}</span>
              </div>
              </div>

              <div class=${styles['tooltip-footer']}>
              <span id="show-more-btn" class=${styles['tooltip-know-more']}> Know More</span>
              <div>
            </div>
          `;
        },
      },

      geo: {
        map: 'world',
        roam: false,
        aspectScale: 0.85,
        zoom: 1,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,

        itemStyle: {
          areaColor: '#F4F4F4',
          borderColor: '#444444',
          borderWidth: 0.2,
        },
        emphasis: {
          itemStyle: {
            areaColor: '#F4F4F4',
          },
          label: {
            show: false,
          },
        },
        regions: geoMapData,
      },
      series: [
        {
          type: 'map',
          map: 'world',
          geoIndex: 0,
          select: {
            disabled: true,
          },
          data: geoMapData,
        },
      ],
    };

    this.chart.setOption(option);

    const resizeHandler = () => {
      this.chart?.resize();
    };
    window.addEventListener('resize', resizeHandler);

    this.willDestroy = () => {
      window.removeEventListener('resize', resizeHandler);
      this.chart?.dispose();
    };

    this.chart.on('showTip', (event: any) => {
      const self = this;

      const e = event as {
        seriesIndex: number;
        dataIndex: number;
      };

      setTimeout(() => {
        const btn = document.getElementById('show-more-btn');
        if (btn) {
          btn.onclick = () => {
            const option = self.chart?.getOption();

            if (!option || !option['series']) return;

            const seriesArray = option['series'] as { data: any[] }[];

            const series = seriesArray[e.seriesIndex];
            if (!series) return;

            const selectedData = series.data[e.dataIndex];

            this.openCountryInfoDrawer(selectedData);

            this.chart?.dispatchAction({
              type: 'hideTip',
            });
          };
        }
      }, 0);
    });
  }

  @action openCountryInfoDrawer(selectedData: any) {
    this.selectedCountry = selectedData;
  }

  @action closeCountryInfoDrawer() {
    this.selectedCountry = null;
  }

  get countryIsSelected() {
    return !!this.selectedCountry;
  }

  willDestroy(): void {
    super.willDestroy?.();
    this.chart?.dispose();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::GeoLocation': typeof PrivacyModuleAppDetailsGeoLocationComponent;
    'privacy-module/app-details/geo-location': typeof PrivacyModuleAppDetailsGeoLocationComponent;
  }
}
