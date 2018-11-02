import DS from 'ember-data';
import { computed } from '@ember/object';

const Personaltoken = DS.Model.extend({
  key: DS.attr('string'),
  name: DS.attr('string'),
  created: DS.attr('date'),

  createdDateOnHumanized: computed('created', function() {
    const created = this.get('created');
    return created.toLocaleDateString();
  })
});

export default Personaltoken;
