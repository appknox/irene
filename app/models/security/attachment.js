import Model, { attr } from '@ember-data/model';
export default class SecurityAttachmentModel extends Model {
  @attr('string') user;
  @attr('string') name;
  @attr('date') createdOn;
}
