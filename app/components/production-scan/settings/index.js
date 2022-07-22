import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ProductionScanSettingsComponent extends Component {
  @service store;
  @service organization;
  @service me;

  get canEditSettings() {
    return this.me.get('org.is_owner');
  }

  @action toggleProductionScanEnabled() {
    const settings = this.store.peekRecord(
      'production-scan/setting',
      this.organization.selected.id
    );

    settings.set('enabled', !settings.enabled);
    settings.save();
  }
}
