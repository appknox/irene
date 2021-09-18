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
  @task(function* (status) {
    try {
      yield this.profile.setShowPcidss({ value: status });
      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `PCI-DSS ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
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
  @task(function* (status) {
    try {
      yield this.profile.setShowHipaa({ value: status });

      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `HIPAA ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
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

  // ASVS
  @task(function* (status) {
    try {
      yield this.profile.setShowAsvs({ value: status });

      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `ASVS ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  saveAsvs;

  @task(function* () {
    try {
      yield this.profile.unsetShowAsvs();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetAsvs;

  // CWE
  @task(function* (status) {
    try {
      yield this.profile.setShowCwe({ value: status });

      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `CWE ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  saveCwe;

  @task(function* () {
    try {
      yield this.profile.unsetShowCwe();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetCwe;

  // MSTG
  @task(function* (status) {
    try {
      yield this.profile.setShowMstg({ value: status });

      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `MSTG ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  saveMstg;

  @task(function* () {
    try {
      yield this.profile.unsetShowMstg();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetMstg;

  // GDPR
  @task(function* (status) {
    try {
      yield this.profile.setShowGdpr({ value: status });

      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `GDPR ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
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
  onSavePcidss(status) {
    this.savePcidss.perform(status);
  }

  @action
  onSaveHipaa(status) {
    this.saveHipaa.perform(status);
  }

  @action
  onSaveAsvs(status) {
    this.saveAsvs.perform(status);
  }

  @action
  onSaveCwe(status) {
    this.saveCwe.perform(status);
  }

  @action
  onSaveMstg(status) {
    this.saveMstg.perform(status);
  }

  @action
  onSaveGdpr(status) {
    this.saveGdpr.perform(status);
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
  onResetAsvs() {
    this.resetAsvs.perform();
  }

  @action
  onResetCwe() {
    this.resetCwe.perform();
  }

  @action
  onResetMstg() {
    this.resetMstg.perform();
  }

  @action
  onResetGdpr() {
    this.resetGdpr.perform();
  }
}
