import Component from '@glimmer/component';

// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';

// Import charts
import {
  BarChart,
  BarSeriesOption,
  PieChart,
  PieSeriesOption,
  LineChart,
  LineSeriesOption,
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
  LegendComponent,
  LegendComponentOption,
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
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

// Create an Option type with only the required components and charts via ComposeOption
export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | PieSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | LegendComponentOption
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

  get chartEffectDependencies() {
    return {
      option: () => this.args.option,
    };
  }

  @action
  initialiseEChart(element: HTMLDivElement) {
    this.echartInstance = echarts.init(element);
    this.echartInstance.setOption(this.args.option);

    if (this.args.onInit) {
      this.args.onInit(this.echartInstance);
    }
  }

  @action
  handleOptionChange() {
    this.echartInstance?.setOption(this.args.option);
  }

  @action
  disposeEChartInstance() {
    this.echartInstance?.dispose();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkChart: typeof AkChartComponent;
  }
}
