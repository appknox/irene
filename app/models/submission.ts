/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-mixins */
import { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import { ModelBaseMixin } from 'irene/mixins/base-model';
import { computed } from '@ember/object';

import UserModel from './user';

export default class SubmissionModel extends ModelBaseMixin {
  @belongsTo('user', { inverse: 'submissions' })
  declare user: AsyncBelongsTo<UserModel>;

  @attr('string')
  declare metaData: string;

  @attr('number')
  declare status: number;

  @attr('string')
  declare reason: string;

  @attr('number')
  declare source: number;

  @attr('string')
  declare packageName: string;

  @attr('string')
  declare statusHumanized: string;

  @computed('reason.length')
  get hasReason() {
    return (this.reason != null ? this.reason.length : 0) > 0;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    submission: SubmissionModel;
  }
}
