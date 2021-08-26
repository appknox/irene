import Model, { attr }  from '@ember-data/model';

const Gdpr = Model.extend({
  code: attr(),
  title: attr(),
});

export default Gdpr;
