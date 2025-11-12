import Model, {
  AsyncBelongsTo,
  AsyncHasMany,
  belongsTo,
  hasMany,
} from '@ember-data/model';

import type FileModel from './file';
import type OwaspModel from './owasp';
import type OwaspMobile2024Model from './owaspmobile2024';

export default class AnalysisOwaspModel extends Model {
  @belongsTo('file', { inverse: null, async: true })
  declare file: AsyncBelongsTo<FileModel>;

  @hasMany('owasp', { async: true, inverse: null })
  declare owasp: AsyncHasMany<OwaspModel>;

  @hasMany('owaspmobile2024', { async: true, inverse: null })
  declare owaspmobile2024: AsyncHasMany<OwaspMobile2024Model>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'analysis-owasp': AnalysisOwaspModel;
  }
}
