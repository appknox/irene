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
      this.profile = yield this.store.peekRecord(
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
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.setShowPcidss({ value: status });

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
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.unsetShowPcidss();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetPcidss;

  // HIPAA
  @task(function* (status) {
    try {
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.setShowHipaa({ value: status });

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
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.unsetShowHipaa();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetHipaa;

  // ASVS
  @task(function* (status) {
    try {
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.setShowAsvs({ value: status });

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
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.unsetShowAsvs();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetAsvs;

  // CWE
  @task(function* (status) {
    try {
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.setShowCwe({ value: status });

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
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.unsetShowCwe();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetCwe;

  // MSTG
  @task(function* (status) {
    try {
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.setShowMstg({ value: status });

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
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.unsetShowMstg();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resetMstg;

  // GDPR
  @task(function* (status) {
    try {
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.setShowGdpr({ value: status });

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
      const profile = this.store.peekRecord(
        'profile',
        this.args.project.activeProfileId
      );
      yield profile.unsetShowGdpr();
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
