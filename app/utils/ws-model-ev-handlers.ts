import type Store from '@ember-data/store';
import type EventBusService from 'irene/services/event-bus';
import type RealtimeService from 'irene/services/realtime';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type SubmissionModel from 'irene/models/submission';

/**Base class for model event handlers*/
export abstract class WsModelEventHandler<T = unknown> {
  constructor(
    protected store: Store,
    protected eventBus: EventBusService,
    protected realtime: RealtimeService
  ) {}

  abstract get modelName(): string;
  abstract onCreate?(wsData: object, model: T): void;
  abstract onUpdate?(wsData: object, model: T): void;
}

/** Handler for analysis model events*/
export class AnalysisEventHandler extends WsModelEventHandler<AnalysisOverviewModel> {
  get modelName() {
    return 'analysis';
  }

  // Push the analysis overview to the store
  // and notify the appropriate file in the scan details page
  private pushAnalysisOverviewAndNotify(wsData: object) {
    const normalized = this.store.normalize('analysis-overview', wsData);
    const analysisModel = this.store.push(normalized) as AnalysisOverviewModel;

    // Trigger event to directly add an analysis to appropriate file in the scan details page
    // when an analysis is ongoing
    this.eventBus.trigger('ws:analysis-overview:update', analysisModel);
  }

  onCreate() {}

  // Perform all analysis overview related actions
  onUpdate(wsData: object) {
    this.pushAnalysisOverviewAndNotify(wsData);
  }
}

/** Handler for dynamic scan events*/
export class DynamicScanEventHandler extends WsModelEventHandler<DynamicscanModel> {
  get modelName() {
    return 'dynamicscan' as const;
  }

  private incrementFileAutoDynamicScanReloadCounter() {
    // Whenever we receive this notification for newly created dynamic scan
    // We increment the counter for the dynamic scan to reload the last automated dynamic scan
    // in the dynamic scan header component
    // REFER: app/components/file-details/dynamic-scan/header/index.ts (LINE: 61)
    this.realtime.incrementProperty('FileAutoDynamicScanReloadCounter');
  }

  // Perform all dynamic scan related actions when a dynamic scan is created
  onCreate() {
    this.incrementFileAutoDynamicScanReloadCounter();
  }

  onUpdate() {}
}

/** Handler for submission model events*/
export class SubmissionEventHandler extends WsModelEventHandler<SubmissionModel> {
  get modelName() {
    return 'submission' as const;
  }

  onCreate() {}
  onUpdate() {}
}
