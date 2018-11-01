import DS from 'ember-data';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

const BaseModelMixin = Mixin.create({
  createdBy: DS.belongsTo('user'),
  createdOn: DS.attr('date'),
  updatedOn: DS.attr('date'),
  uuid: DS.attr('string'),

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
