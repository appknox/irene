import Model, { attr } from '@ember-data/model';

export default class Owasp extends Model {
  @attr('string') code;
  @attr('string') title;
  @attr('string') description;
  @attr('string') year;
}
