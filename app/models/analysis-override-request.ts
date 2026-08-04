import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import type AnalysisModel from './analysis';

export interface OverrideRequestUser {
  id: number;
  username: string;
  email: string;
}

export enum OverrideRequestStatus {
  PENDING = 1,
  APPROVED = 2,
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
