import Model, {
  attr
} from '@ember-data/model';

export default class CreditsPartnerCreditsStatModel extends Model {

  @attr('number') creditsLeft;
  @attr('boolean') isPerScan;

}
