/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/no-get */
import Model, { attr }  from '@ember-data/model';
import { computed } from '@ember/object';

const Personaltoken = Model.extend({
  key: attr('string'),
  name: attr('string'),
  created: attr('date'),

  createdDateOnHumanized: computed('created', function() {
    const created = this.get('created');
    return created.toLocaleDateString();
  })
});

export default Personaltoken;
