import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';

export default class RegulatoryPreferenceProfileComponent extends Component {
  @service intl;
  @service store;
  @service('notifications') notify;

  @tracked project;
  @tracked profile;

  constructor() {
    super(...arguments);
    this.fetchProfile.perform();
  }

  @task(function* () {
    try {
      this.profile = yield this.store.findRecord(
        'profile',
        this.args.project.activeProfileId
      );
    } catch {
      this.profile = null;
      return;
    }
  })
  fetchProfile;

  // PCIDSS
  @task(function* (event) {
    const status = event.target.checked;
    try {
      yield this.profile.setShowPcidss({ value: status });
      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `PCI-DSS ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !status;
    }
  })
  savePcidss;

  @task(function* () {
    try {
      yield this.profile.unsetShowPcidss();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetPcidss;

  // HIPAA
  @task(function* (event) {
    const status = event.target.checked;
    try {
      yield this.profile.setShowHipaa({ value: status });

      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `HIPAA ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !status;
    }
  })
  saveHipaa;

  @task(function* () {
    try {
      yield this.profile.unsetShowHipaa();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetHipaa;

  // GDPR
  @task(function* (event) {
    const status = event.target.checked;
    try {
      yield this.profile.setShowGdpr({ value: status });

      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `GDPR ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !status;
    }
  })
  saveGdpr;

  @task(function* () {
    try {
      yield this.profile.unsetShowGdpr();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetGdpr;

  @action
  onSavePcidss(event) {
    this.savePcidss.perform(event);
  }

  @action
  onSaveHipaa(event) {
    this.saveHipaa.perform(event);
  }

  @action
  onSaveGdpr(event) {
    this.saveGdpr.perform(event);
  }

  @action
  onResetPcidss() {
    this.resetPcidss.perform();
  }

  @action
  onResetHipaa() {
    this.resetHipaa.perform();
  }

  @action
  onResetGdpr() {
    this.resetGdpr.perform();
  }
}
