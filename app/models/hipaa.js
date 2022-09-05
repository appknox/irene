import Model, { attr } from '@ember-data/model';

export default class Hipaa extends Model {
  @attr('string') code;
  @attr('string') title;
  @attr('string') safeguard;
  @attr() standards;
}
