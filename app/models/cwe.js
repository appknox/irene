import Model, { attr } from '@ember-data/model';

export default class Cwe extends Model {
  @attr('string') code;
  @attr('string') url;
}
