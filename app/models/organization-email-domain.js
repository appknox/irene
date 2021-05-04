import Model, {
  attr
} from '@ember-data/model';

export default class OrganizationEmailDomainModel extends Model {

  @attr('string') domainName;
}
