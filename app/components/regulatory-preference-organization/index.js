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

  @task(function* (value) {
    try {
      this.orgPreference.reportPreference.show_pcidss = value;
      yield this.orgPreference.save();
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  savePcidss;

  @task(function* (value) {
    try {
      this.orgPreference.reportPreference.show_hipaa = value;
      yield this.orgPreference.save();
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  saveHipaa;

  @task(function* (value) {
    try {
      this.orgPreference.reportPreference.show_gdpr = value;
      yield this.orgPreference.save();
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  saveGdpr;
}
