/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { addObserver, removeObserver } from '@ember/object/observers';

// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';

// Import bar charts, all suffixed with Chart
import {
  BarChart,
  BarSeriesOption,
  PieChart,
  PieSeriesOption,
} from 'echarts/charts';

// Import the tooltip, title, rectangular coordinate system, dataset and transform components
import {
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  DatasetComponent,
  DatasetComponentOption,
  TransformComponent,
} from 'echarts/components';

// Features like Universal Transition and Label Layout
import { LabelLayout, UniversalTransition } from 'echarts/features';

// Import the Canvas renderer
// Note that including the CanvasRenderer or SVGRenderer is a required step
import { CanvasRenderer } from 'echarts/renderers';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// Register the required components
echarts.use([
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

// Create an Option type with only the required components and charts via ComposeOption
export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | PieSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
>;

export type ECInstance = echarts.ECharts;

interface AkChartSignature {
  Element: HTMLDivElement;
  Args: {
    width?: string;
    height?: string;
    option: ECOption;
    onInit?: (instance: ECInstance) => void;
  };
}

export default class AkChartComponent extends Component<AkChartSignature> {
  @tracked echartInstance: ECInstance | null = null;

  @action
  initialiseEChart(element: HTMLDivElement) {
    this.echartInstance = echarts.init(element);
    this.echartInstance.setOption(this.args.option);

    if (this.args.onInit) {
      this.args.onInit(this.echartInstance);
    }

    addObserver(this.args, 'option', this, this.handleOptionChange);
  }

  @action
  handleOptionChange() {
    this.echartInstance?.setOption(this.args.option);
  }

  @action
  disposeEChartInstance() {
    this.echartInstance?.dispose();

    removeObserver(this.args, 'option', this, this.handleOptionChange);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkChart: typeof AkChartComponent;
  }
}
