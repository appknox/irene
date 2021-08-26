import Model, { attr }  from '@ember-data/model';
import Inflector from  'ember-inflector';
const inflector = Inflector.inflector;

inflector.irregular('asvs', 'asvses');

const Asvs = Model.extend({
  code: attr(),
  title: attr(),
});

export default Asvs;
