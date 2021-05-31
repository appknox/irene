import Model, { attr }  from '@ember-data/model';

const Hipaa = Model.extend({
  code: attr(),
  safeguard: attr(),
  title: attr(),
  standards: attr()
});

export default Hipaa;
