import DS from 'ember-data';

const Personaltoken = DS.Model.extend({
  key: DS.attr('string'),
  name: DS.attr('string'),
  created: DS.attr('date'),

  createdDateOnHumanized: (function() {
    const created = this.get('created');
    return created.toLocaleDateString();
  }).property('created')
});

export default Personaltoken;
