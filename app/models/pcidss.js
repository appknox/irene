import Model, { attr } from '@ember-data/model';

export default class Pcidss extends Model {
  @attr('string') code;
  @attr('string') title;
  @attr('string') description;
}
