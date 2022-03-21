/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/no-get */
import Model, { attr }  from '@ember-data/model';
import { computed } from '@ember/object';

const Plan = Model.extend({
  planId: attr('string'),
  name: attr('string'),
  description: attr('string'),
  price: attr('number'),
  projectsLimit: attr("number"),
  monthlyUrl: attr('string'),
  quarterlyUrl: attr('string'),
  halfYearlyUrl: attr('string'),
  yearlyUrl: attr('string'),
  monthlyPrice: attr('string'),
  quarterlyPrice: attr('string'),
  halfYearlyPrice: attr('string'),
  yearlyPrice: attr('string'),

  descriptionItems: computed('description', function() {
    const description = this.get("description");
    return (description != null ? description.split(",") : undefined);
  })
});

export default Plan;
