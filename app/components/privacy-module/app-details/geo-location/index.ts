import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import * as echarts from 'echarts';
import type RouterService from '@ember/routing/router-service';

import styles from './index.scss';
import type FileModel from 'irene/models/file';
import type PrivacyModuleService from 'irene/services/privacy-module';
import type { HostUrl } from 'irene/models/geo-location';

export interface PrivacyModuleAppDetailsGeoLocationSignature {
  Args: {
    file: FileModel;
  };
}

interface GeoMapData {
  name: string;
  countryName: string;
  hostLength: number;
  hosts: (HostUrl & { firstSourceLocation: string })[];
  itemStyle: { areaColor: string };
  emphasis: { itemStyle: { areaColor: string } };
}

interface TooltipFormatterParams {
  name: string;
  data?: GeoMapData;
  seriesIndex?: number;
  dataIndex?: number;
}

interface ChartShowTipEvent {
  seriesIndex: number;
  dataIndex: number;
}

interface ChartElement extends HTMLElement {
  __chart__?: echarts.ECharts | null;
  __component__?: PrivacyModuleAppDetailsGeoLocationComponent;
}

const WORLD_ICON_SVG = `
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 0.25C3.04813 0.25 0.25 3.04813 0.25 6.5C0.25 9.95187 3.04813 12.75 6.5 12.75C9.95187 12.75 12.75 9.95187 12.75 6.5C12.75 3.04813 9.95187 0.25 6.5 0.25ZM10.8237 4H8.81437C8.721 3.29675 8.60322 2.59695 8.46125 1.90188C9.45362 2.32941 10.282 3.06508 10.8237 4ZM7.13375 1.545C7.17625 1.765 7.37563 2.81875 7.53688 4H5.46312C5.62437 2.81875 5.82375 1.765 5.86625 1.545C6.07438 1.51813 6.285 1.5 6.5 1.5C6.715 1.5 6.92562 1.51813 7.13375 1.545ZM7.75 6.5C7.75 6.87375 7.72312 7.30375 7.68187 7.75H5.31813C5.27688 7.30375 5.25 6.87375 5.25 6.5C5.25 6.12625 5.27688 5.69625 5.31813 5.25H7.68187C7.72312 5.69625 7.75 6.12625 7.75 6.5ZM4.53875 1.90188C4.39678 2.59695 4.279 3.29675 4.18563 4H2.17625C2.71801 3.06508 3.54638 2.32941 4.53875 1.90188ZM1.66438 5.25H4.0525C4.02062 5.6675 4 6.09 4 6.5C4 6.91 4.02063 7.3325 4.05312 7.75H1.66438C1.56062 7.34938 1.5 6.9325 1.5 6.5C1.5 6.0675 1.56125 5.65062 1.66438 5.25ZM2.17625 9H4.18563C4.30312 9.89 4.44813 10.6562 4.53875 11.0981C3.54638 10.6706 2.71801 9.93492 2.17625 9ZM5.86625 11.455C5.71074 10.6403 5.57632 9.82167 5.46312 9H7.53688C7.42341 9.82163 7.28899 10.6402 7.13375 11.455C6.92562 11.4819 6.715 11.5 6.5 11.5C6.285 11.5 6.07438 11.4819 5.86625 11.455ZM8.46125 11.0981C8.55188 10.6562 8.69687 9.89 8.81437 9H10.8237C10.282 9.93492 9.45362 10.6706 8.46125 11.0981ZM11.3356 7.75H8.9475C8.97937 7.3325 9 6.91 9 6.5C9 6.09 8.97937 5.6675 8.94687 5.25H11.335C11.4388 5.65062 11.5 6.0675 11.5 6.5C11.5 6.9325 11.4394 7.34938 11.3356 7.75Z" fill="black"/>
  </svg>
`;

export default class PrivacyModuleAppDetailsGeoLocationComponent extends Component<PrivacyModuleAppDetailsGeoLocationSignature> {
  @service declare privacyModule: PrivacyModuleService;
  @service declare router: RouterService;
  @service('browser/window') declare window: Window;

  windowRef: Window | null = null;
  chart: echarts.ECharts | null = null;
  resizeHandler: (() => void) | null = null;

  @tracked selectedCountry: GeoMapData | null = null;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppDetailsGeoLocationSignature['Args']
  ) {
    super(owner, args);

    this.privacyModule.fetchGeoLocationData.perform(
      this.fileId,
      this.privacyProjectID,
      true
    );
  }

  get fileId() {
    return this.args.file.id;
  }

  get geoLocationData() {
    return this.privacyModule.geoLocationDataList;
  }

  get privacyProjectID() {
    return this.router.currentRoute?.parent?.params['app_id'];
  }

  get isFetching() {
    return this.privacyModule.fetchGeoLocationData.isRunning;
  }

  get geoDataAvailable() {
    return this.privacyModule.geoDataAvailable;
  }

  get showEmptyContent() {
    return !this.isFetching && !this.geoDataAvailable;
  }

  get countryIsSelected() {
    return !!this.selectedCountry;
  }

  @action
  async setupChart(element: HTMLElement): Promise<void> {
    this.windowRef = this.window;

    const response = await fetch('/world.json');
    const worldGeoJSON = await response.json();

    const geoMapData = this.transformGeoLocationData() || [];
    const allowedCountries = geoMapData.map((d) => d.name);

    echarts.registerMap('world', worldGeoJSON);
    this.chart = echarts.init(element);

    const option = this.buildChartOption(geoMapData, allowedCountries);
    this.chart.setOption(option);

    this.setupChartEventHandlers(element as ChartElement);
    this.setupResizeHandler();
  }

  private transformGeoLocationData(): GeoMapData[] {
    const data = this.geoLocationData ?? [];

    return data.map((d) => {
      const areaColorProperty = d.isHighRiskRegion
        ? '--privacy-module-geo-location-area-error-color'
        : '--privacy-module-geo-location-area-color';

      const areaColor = this.getPropertyValue(areaColorProperty);

      return {
        name: d.countryCode,
        countryName: d.countryName,
        hostLength: d.hostUrls?.length || 0,
        hosts:
          d.hostUrls?.map((host) => ({
            ...host,
            firstSourceLocation: host.source_location[0] || '',
          })) || [],
        itemStyle: { areaColor },
        emphasis: { itemStyle: { areaColor } },
      };
    });
  }

  private buildChartOption(
    geoMapData: GeoMapData[],
    allowedCountries: string[]
  ): echarts.EChartsOption {
    return {
      tooltip: {
        trigger: 'item',
        enterable: true,
        className: styles['country-tooltip'],
        position: (point) => [point[0], point[1]],
        formatter: (params) =>
          this.formatTooltip(
            params as TooltipFormatterParams,
            allowedCountries
          ),
      },
      geo: this.buildGeoConfig(geoMapData),
      series: [
        {
          type: 'map',
          map: 'world',
          geoIndex: 0,
          select: { disabled: true },
          data: geoMapData,
        },
      ],
    };
  }

  private buildGeoConfig(geoMapData: GeoMapData[]) {
    return {
      map: 'world',
      roam: false,
      aspectScale: 0.85,
      zoom: 1,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      itemStyle: {
        areaColor: this.getPropertyValue(
          '--privacy-module-geo-location-area-background-color'
        ),

        borderColor: this.getPropertyValue(
          '--privacy-module-geo-location-area-border-color'
        ),
        borderWidth: 0.2,
      },
      emphasis: {
        itemStyle: {
          areaColor: this.getPropertyValue(
            '--privacy-module-geo-location-area-background-color'
          ),
        },
        label: { show: false },
      },
      regions: geoMapData,
    };
  }

  private formatTooltip(
    params: TooltipFormatterParams,
    allowedCountries: string[]
  ): string {
    const { name, data } = params;
    const notAllowedCountry = !allowedCountries.includes(name);

    // If the country is not allowed or the data is not available, return an empty string
    if (notAllowedCountry || !data) {
      return '';
    }

    const { countryName, hostLength } = data;

    return `
      <div>
        <div class="${styles['tooltip-body']}">
          <div class="${styles['tooltip-country-name']}">${countryName}</div>
          <div class="${styles['tooltip-number-icon']}">
            ${WORLD_ICON_SVG}
            <span class="${styles['tooltip-number']}">${hostLength}</span>
          </div>
        </div>
        <div class="${styles['tooltip-footer']}">
          <span id="show-more-btn" class="${styles['tooltip-know-more']}">Know More</span>
        </div>
      </div>
    `;
  }

  private setupChartEventHandlers(element: ChartElement): void {
    // This is necessary for testing
    if (this.window?.QUnit) {
      element.__chart__ = this.chart;
      element.__component__ = this;
    }

    this.chart?.on('showTip', (event) => {
      this.handleShowTip(event as ChartShowTipEvent);
    });
  }

  private handleShowTip(event: ChartShowTipEvent): void {
    setTimeout(() => {
      const btn = document.getElementById('show-more-btn');

      if (btn) {
        btn.onclick = () => {
          const selectedData = this.getSelectedChartData(
            event.seriesIndex,
            event.dataIndex
          );

          if (selectedData) {
            this.openCountryInfoDrawer(selectedData);
            this.chart?.dispatchAction({ type: 'hideTip' });
          }
        };
      }
    }, 0);
  }

  private getSelectedChartData(
    seriesIndex: number,
    dataIndex: number
  ): GeoMapData | null {
    const option = this.chart?.getOption();
    const seriesArray = option?.['series'] as { data: GeoMapData[] }[];

    if (!seriesArray) {
      return null;
    }

    const series = seriesArray[seriesIndex];

    return series?.data?.[dataIndex] || null;
  }

  private setupResizeHandler(): void {
    this.resizeHandler = () => this.chart?.resize();
    this.window?.addEventListener('resize', this.resizeHandler);
  }

  private getPropertyValue(property: string): string {
    return getComputedStyle(document.body).getPropertyValue(property);
  }

  @action
  openCountryInfoDrawer(selectedData: GeoMapData): void {
    this.selectedCountry = selectedData;
  }

  @action
  closeCountryInfoDrawer(): void {
    this.selectedCountry = null;
  }

  willDestroy(): void {
    super.willDestroy();

    if (this.resizeHandler) {
      this.windowRef?.removeEventListener('resize', this.resizeHandler);
    }

    this.chart?.dispose();
    this.chart = null;

    this.windowRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::GeoLocation': typeof PrivacyModuleAppDetailsGeoLocationComponent;
    'privacy-module/app-details/geo-location': typeof PrivacyModuleAppDetailsGeoLocationComponent;
  }
}
