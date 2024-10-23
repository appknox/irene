import Model, { attr } from '@ember-data/model';

export default class SkInventoryApprovalStatusModel extends Model {
  @attr('number')
  declare approvalStatus: number;

  @attr('string')
  declare approvalStatusDisplay: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-inventory-approval-status': SkInventoryApprovalStatusModel;
  }
}
