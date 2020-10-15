import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class ApplicationRoute extends Route {
  @service headData;
  @service intl;
  @service whitelabel;

  beforeModel() {
    return this.get('intl').setLocale(['en']);
  }

  afterModel() {
    this.headData.title = "Appknox";
  }

  setupController(controller) {
    controller.set('whitelabelName', this.whitelabel.name);
  }
}
