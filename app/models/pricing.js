import Model, { attr }  from '@ember-data/model';
import { computed } from '@ember/object';

const Pricing = Model.extend({
  name: attr('string'),
  description: attr('string'),
  price: attr('number'),
  projectsLimit: attr("number"),

  descriptionItems: computed('description', function() {
    const description = this.get("description");
    return (description != null ? description.split(",") : undefined);
  })
});

export default Pricing;
