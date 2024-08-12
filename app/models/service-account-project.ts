import Model, { type AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';

import type ProjectModel from './project';
import type ServiceAccountModel from './service-account';

export default class ServiceAccountProjectModel extends Model {
  @belongsTo('project')
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('service-account')
  declare serviceAccount: AsyncBelongsTo<ServiceAccountModel>;

  @attr('date')
  declare addedOn: Date;
}
