import DS from 'ember-data';
import { computed } from '@ember/object';

const Pricing = DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  price: DS.attr('number'),
  projectsLimit: DS.attr("number"),

  descriptionItems: computed('description', function() {
    const description = this.get("description");
    return (description != null ? description.split(",") : undefined);
  })
});

export default Pricing;
