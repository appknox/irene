import Model, { attr }  from '@ember-data/model';

const Mstg = Model.extend({
  code: attr(),
  title: attr(),
});

export default Mstg;
