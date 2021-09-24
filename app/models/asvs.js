import Model, { attr } from '@ember-data/model';

export default class Asvs extends Model {
  @attr('string') code;
  @attr('string') title;
}
