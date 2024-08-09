import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';

import ProjectModel from './project';

export default class ServiceAccountProjectModel extends Model {
  @belongsTo('project')
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('service-account')
  declare serviceAccount: AsyncBelongsTo<ServiceAccountProjectModel>;

  @attr('date')
  declare addedOn: Date;
}
