import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class AppMonitoringSettingsComponent extends Component {
  @service me;

  get canEditSettings() {
    return this.me.get('org.is_owner');
  }

  @task(function* () {
    const settings = yield this.args.settings;

    settings.set('enabled', !settings.enabled);
    yield settings.save();
  })
  toggleAppMonitoringEnabled;
}
