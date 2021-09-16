import Model, { attr } from '@ember-data/model';
import Inflector from 'ember-inflector';

const inflector = Inflector.inflector;
inflector.irregular('asvs', 'asvses');

export default class Asvs extends Model {
  @attr('string') code;
  @attr('string') title;
}
