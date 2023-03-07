import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import AmAppModel from './am-app';

export default class AmAppStoreInstanceModel extends Model {
  @attr('string')
  declare ulid: string;

  @attr('string')
  declare icon: string;

  @attr('string')
  declare name: string;

  @attr('date')
  declare createdOn: Date;

  @attr('string')
  declare countryCode: string;

  @belongsTo('am-app')
  declare amApp: AsyncBelongsTo<AmAppModel>;
}
