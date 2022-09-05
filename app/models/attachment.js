import Model, { attr } from '@ember-data/model';

export default class Analysis extends Model {
  @attr('string') uuid;
  @attr('string') name;
  @attr('string') downloadUrl;
}
