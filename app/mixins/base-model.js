/*eslint getter-return: ["error", { allowImplicit: true }]*/
/* eslint-disable ember/no-new-mixins, prettier/prettier, ember/no-get */
import { attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { isEmpty } from '@ember/utils';

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
export const ModelBaseMixin = (superclass) =>
  class extends superclass {
    @belongsTo('user') createdBy;
    @attr('date') createdOn;
    @attr('date') updatedOn;
    @attr('string') uuid;

    get createdOnHumanized() {
      const createdOn = this.createdOn;
      if (isEmpty(createdOn)) {
        return;
      }
      return `${createdOn.toLocaleDateString()}`;
    }

    get createdOnDateTime() {
      const createdOn = this.get('createdOn');
      if (isEmpty(createdOn)) {
        return;
      }
      return `${createdOn.toDateString()}, ${createdOn.toLocaleTimeString()}`;
    }
  };

export default BaseModelMixin;
