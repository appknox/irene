import DS from 'ember-data';

const Owasp = DS.Model.extend({
  code: DS.attr(),
  title: DS.attr(),
  description: DS.attr(),
  year: DS.attr()
});

export default Owasp;
