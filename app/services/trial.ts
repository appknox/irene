import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TrialService extends Service {
  @tracked isTrial = true;
}
