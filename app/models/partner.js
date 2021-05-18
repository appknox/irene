import Model, {
  attr
} from '@ember-data/model';

export default class PartnerModel extends Model {

  @attr() access;
}
