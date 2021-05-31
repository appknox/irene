import Model, { attr }  from '@ember-data/model';

const Pcidss = Model.extend({
  code: attr(),
  title: attr(),
  description: attr()
});

export default Pcidss;
