import Component from '@glimmer/component';

import type { ReportChartTile } from 'irene/utils/ai-reporting/report-chart';

interface AiReportingPreviewChartTilesSignature {
  Args: { tiles: ReportChartTile[] };
}

/** Big number tiles for a report of totals without groups. */
export default class AiReportingPreviewChartTilesComponent extends Component<AiReportingPreviewChartTilesSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::Chart::Tiles': typeof AiReportingPreviewChartTilesComponent;
  }
}
