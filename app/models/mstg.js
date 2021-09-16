import Model, { attr } from '@ember-data/model';

export default class Mstg extends Model {
  @attr('string') code;
  @attr('string') title;
}
