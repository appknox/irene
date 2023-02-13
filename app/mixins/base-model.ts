/* eslint-disable ember/no-new-mixins, ember/no-get, ember/no-computed-properties-in-native-classes */
import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { isEmpty } from '@ember/utils';

import UserModel from 'irene/models/user';

const BaseModelMixin = Mixin.create({
  createdBy: belongsTo('user'),
  createdOn: attr('date'),
  updatedOn: attr('date'),
  uuid: attr('string'),

  createdOnHumanized: computed('createdOn', function () {
    const createdOn = this.get('createdOn');
    if (isEmpty(createdOn)) {
      return;
    }
    return `${createdOn.toLocaleDateString()}`;
  }),

  createdOnDateTime: computed('createdOn', function () {
    const createdOn = this.get('createdOn');
    if (isEmpty(createdOn)) {
      return;
    }
    return `${createdOn.toDateString()}, ${createdOn.toLocaleTimeString()}`;
  }),
});

// Class based mixin support for non classic models
export class ModelBaseMixin extends Model {
  @belongsTo('user')
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

export default BaseModelMixin;
