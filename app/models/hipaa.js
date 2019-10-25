import DS from 'ember-data';
const { Model } = DS;

const Hipaa = Model.extend({
  code: DS.attr(),
  safeguard: DS.attr(),
  title: DS.attr(),
  standards: DS.attr()
});

export default Hipaa;
