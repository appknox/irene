import Model, { attr }  from '@ember-data/model';

const Asv = Model.extend({
  code: attr(),
  title: attr(),
});

export default Asv;
