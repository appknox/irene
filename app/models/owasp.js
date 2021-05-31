import Model, { attr }  from '@ember-data/model';

const Owasp = Model.extend({
  code: attr(),
  title: attr(),
  description: attr(),
  year: attr()
});

export default Owasp;
