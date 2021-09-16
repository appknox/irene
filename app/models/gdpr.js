import Model, { attr } from '@ember-data/model';

export default class Gdpr extends Model {
  @attr('string') code;
  @attr('string') title;
}
