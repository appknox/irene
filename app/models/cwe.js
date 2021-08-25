import Model, { attr }  from '@ember-data/model';

const Cwe = Model.extend({
  code: attr(),
  url: attr(),
});

export default Cwe;
