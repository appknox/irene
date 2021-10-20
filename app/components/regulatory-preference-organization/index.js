import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';
import { action, set } from '@ember/object';

export default class RegulatoryPreferenceOrganizationComponent extends Component {
  @service intl;
  @service store;
  @service('notifications') notify;
  @service organization;

  @tracked orgPreference;

  @action initComp() {
    this.fetchOrganizationPreference.perform();
  }

  @action onSavePcidss(event) {
    this.savePcidss.perform(event.target.checked);
  }

  @action onSaveHipaa(event) {
    this.saveHipaa.perform(event.target.checked);
  }

  @action onSaveGdpr(event) {
    this.saveGdpr.perform(event.target.checked);
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

  @task(function* (state) {
    try {
      this.orgPreference.reportPreference.show_pcidss = state;
      yield this.orgPreference.save();
      this.notify.success(this.intl.t('regulatoryPreferenceSuccessMsg'));
    } catch (err) {
      this.notify.error(parseError(err));
      set(this.orgPreference.reportPreference, 'show_pcidss', !state);
    }
  })
  savePcidss;

  @task(function* (state) {
    try {
      this.orgPreference.reportPreference.show_hipaa = state;
      yield this.orgPreference.save();
      this.notify.success(this.intl.t('regulatoryPreferenceSuccessMsg'));
    } catch (err) {
      this.notify.error(parseError(err));
      set(this.orgPreference.reportPreference, 'show_hipaa', !state);
    }
  })
  saveHipaa;

  @task(function* (state) {
    try {
      this.orgPreference.reportPreference.show_gdpr = state;
      yield this.orgPreference.save();
      this.notify.success(this.intl.t('regulatoryPreferenceSuccessMsg'));
    } catch (err) {
      this.notify.error(parseError(err));
      set(this.orgPreference.reportPreference, 'show_gdpr', !state);
    }
  })
  saveGdpr;
}
