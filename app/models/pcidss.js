import DS from 'ember-data';

const Pcidss = DS.Model.extend({
  code: DS.attr(),
  title: DS.attr(),
  description: DS.attr()
});

export default Pcidss;
