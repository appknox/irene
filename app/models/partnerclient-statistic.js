import Model, {
  attr
} from '@ember-data/model';

export default class PartnerclientStatisticModel extends Model {

  @attr('number') filesCount;
  @attr('number') projectsCount;
  @attr('number') usersCount;

}
