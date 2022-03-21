/* eslint-disable ember/no-new-mixins, prettier/prettier, ember/no-get */
import { belongsTo } from '@ember-data/model';
import { attr } from '@ember-data/model';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

const BaseModelMixin = Mixin.create({
  createdBy: belongsTo('user'),
  createdOn: attr('date'),
  updatedOn: attr('date'),
  uuid: attr('string'),

  createdOnHumanized: computed("createdOn", function() {
    const createdOn = this.get("createdOn");
    if (isEmpty(createdOn)) {
      return;
    }
    return `${createdOn.toLocaleDateString()}`;
  }),

  createdOnDateTime: computed("createdOn", function() {
    const createdOn = this.get("createdOn");
    if (isEmpty(createdOn)) {
      return;
    }
    return `${createdOn.toDateString()}, ${createdOn.toLocaleTimeString()}`;
  })
});

export default BaseModelMixin;
