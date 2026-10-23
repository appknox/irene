/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { addObserver, removeObserver } from '@ember/object/observers';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

// Type-only imports are erased at build time, so these don't pull echarts
// into the main bundle - only the dynamic imports in loadECharts() below do.
import type * as EChartsCore from 'echarts/core';
import type {
  BarSeriesOption,
  PieSeriesOption,
  LineSeriesOption,
} from 'echarts/charts';
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
  LegendComponentOption,
} from 'echarts/components';

// Create an Option type with only the required components and charts via ComposeOption
export type ECOption = EChartsCore.ComposeOption<
  | BarSeriesOption
  | PieSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | LegendComponentOption
>;

export type ECInstance = EChartsCore.ECharts;

let echartsPromise: Promise<typeof EChartsCore> | null = null;

/** Loads echarts and its required pieces on demand, registering them once and caching the result. */
function loadECharts() {
  if (!echartsPromise) {
    echartsPromise = waitForPromise(
      Promise.all([
        import('echarts/core'),
        import('echarts/charts'),
        import('echarts/components'),
        import('echarts/features'),
        import('echarts/renderers'),
      ]).then(([echarts, charts, components, features, renderers]) => {
        echarts.use([
          charts.BarChart,
          charts.PieChart,
          charts.LineChart,
          components.TitleComponent,
          components.TooltipComponent,
          components.GridComponent,
          components.DatasetComponent,
          components.TransformComponent,
          components.LegendComponent,
          features.LabelLayout,
          features.UniversalTransition,
          renderers.CanvasRenderer,
        ]);

        return echarts;
      })
    );
  }

  return echartsPromise;
}

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
  hasRegisteredOptionObserver = false;

  @action
  async initialiseEChart(element: HTMLDivElement) {
    const echarts = await loadECharts();

    if (this.isDestroying) {
      return;
    }

    this.echartInstance = echarts.init(element);
    this.echartInstance.setOption(this.args.option);

    if (this.args.onInit) {
      this.args.onInit(this.echartInstance);
    }

    addObserver(this.args, 'option', this, this.handleOptionChange);
    this.hasRegisteredOptionObserver = true;
  }

  @action
  handleOptionChange() {
    this.echartInstance?.setOption(this.args.option);
  }

  @action
  disposeEChartInstance() {
    this.echartInstance?.dispose();

    // initialiseEChart awaits a dynamic import before registering this
    // observer, so the component can be destroyed first if it unmounts
    // (e.g. fast route/list changes) while the import is still pending -
    // removeObserver would then throw trying to remove a listener that
    // was never added.
    if (this.hasRegisteredOptionObserver) {
      removeObserver(this.args, 'option', this, this.handleOptionChange);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkChart: typeof AkChartComponent;
  }
}
