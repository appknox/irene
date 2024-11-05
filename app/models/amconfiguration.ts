import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class AMConfigurationModel extends Model {
  @attr('boolean')
  declare enabled: boolean;

  @belongsTo('organization', { async: true, inverse: null })
  declare organization: AsyncBelongsTo<OrganizationModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    amconfiguration: AMConfigurationModel;
  }
}
