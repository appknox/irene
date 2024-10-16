import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import { isEmpty } from '@ember/utils';

import UserModel from 'irene/models/user';

// Class based mixin support for non classic models
export class ModelBaseMixin extends Model {
  @belongsTo('user', { async: true, inverse: null })
  declare createdBy: AsyncBelongsTo<UserModel>;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @attr('string')
  declare uuid: string;

  get createdOnHumanized() {
    const createdOn = this.createdOn;
    if (isEmpty(createdOn)) {
      return;
    }
    return `${createdOn.toLocaleDateString()}`;
  }

  get createdOnDateTime() {
    const createdOn = this.createdOn;

    if (isEmpty(createdOn)) {
      return;
    }

    return `${createdOn.toDateString()}, ${createdOn.toLocaleTimeString()}`;
  }
}
