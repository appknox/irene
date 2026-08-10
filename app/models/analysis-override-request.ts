import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type AnalysisModel from './analysis';

export interface OverrideRequestUser {
  id: number;
  username: string;
  email: string;
}

export enum OverrideRequestStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,

  // Terminal State: an owner or admin edited the override directly, outside the
  // approve flow, after it was approved. The member's approved values no longer
  // reflect the current risk, and no further requests may be raised for the
  // analysis.
  COMPLETED = 4,

  // Terminal State: an owner or admin reset (deleted) the override directly after it
  // was approved. The risk is back to default, and members may raise a new
  // override request for the analysis.
  OWNER_RESET = 5,
}

export default class AnalysisOverrideRequestModel extends Model {
  @attr('number') declare status: number;
  @attr('string') declare statusDisplay: string;
  @attr('number') declare requestedStatus: number;
  @attr('string') declare requestedStatusDisplay: string;
  @attr('string') declare comment: string;
  @attr('string') declare analysisOverrideCriteria: string | null;

  @attr() declare requestedBy: OverrideRequestUser;
  @attr() declare reviewedBy: OverrideRequestUser | null;

  @attr('date') declare createdOn: Date;
  @attr('date') declare reviewedOn: Date | null;

  @belongsTo('analysis', { inverse: null, async: true })
  declare analysis: AsyncBelongsTo<AnalysisModel>;

  get isPending() {
    return this.status === OverrideRequestStatus.PENDING;
  }

  get isApproved() {
    return this.status === OverrideRequestStatus.APPROVED;
  }

  async approve() {
    const adapter = this.store.adapterFor('analysis-override-request');
    await adapter.approve(this.id);
  }

  async reject(reason: string) {
    const adapter = this.store.adapterFor('analysis-override-request');
    await adapter.reject(this.id, reason);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'analysis-override-request': AnalysisOverrideRequestModel;
  }
}
