import Model, {
  attr
} from '@ember-data/model';

export default class CreditsClientCreditsStatModel extends Model {

  @attr('number') creditsLeft;
  @attr('boolean') isPerScan;
}
