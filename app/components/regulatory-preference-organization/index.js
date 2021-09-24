import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';

export default class RegulatoryPreferenceOrganizationComponent extends Component {
  @service intl;
  @service store;
  @service('notifications') notify;
  @service organization;

  @tracked orgPreference;

  constructor() {
    super(...arguments);
    this.fetchOrganizationPreference.perform();
  }

  @task(function* () {
    try {
      this.orgPreference = yield this.store.queryRecord(
        'organization-preference',
        {}
      );
    } catch {
      this.orgPreference = null;
      return;
    }
  })
  fetchOrganizationPreference;

  @task(function* (event) {
    try {
      this.orgPreference.reportPreference.show_pcidss = event.target.checked;
      yield this.orgPreference.save();
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !event.target.checked;
    }
  })
  savePcidss;

  @task(function* (event) {
    try {
      this.orgPreference.reportPreference.show_hipaa = event.target.checked;
      yield this.orgPreference.save();
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !event.target.checked;
    }
  })
  saveHipaa;

  @task(function* (event) {
    try {
      this.orgPreference.reportPreference.show_gdpr = event.target.checked;
      yield this.orgPreference.save();
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !event.target.checked;
    }
  })
  saveGdpr;
}
