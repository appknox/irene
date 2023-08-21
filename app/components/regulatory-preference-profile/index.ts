import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';
import Store from '@ember-data/store';
import { Service as IntlService } from 'ember-intl';
import ProjectModel from 'irene/models/project';
import ProfileModel from 'irene/models/profile';

interface RegulatoryPreferenceSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class RegulatoryPreferenceProfileComponent extends Component<RegulatoryPreferenceSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked project: ProjectModel | any = null;
  @tracked profile: ProfileModel | any = null;

  constructor(owner: unknown, args: RegulatoryPreferenceSignature['Args']) {
    super(owner, args);
    this.fetchProfile.perform();
  }

  fetchProfile = task(async () => {
    try {
      if (this.args.project) {
        this.profile = await this.store.findRecord(
          'profile',
          this.args.project.activeProfileId
        );
      }
    } catch {
      this.profile = null;
      return;
    }
  });

  // PCIDSS

  savePcidss = task(async (event) => {
    const status = event.target.checked;
    try {
      await this.profile.setShowPcidss({ value: status });
      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `PCI-DSS ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !status;
    }
  });

  resetPcidss = task(async () => {
    try {
      await this.profile.unsetShowPcidss();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  // HIPAA

  saveHipaa = task(async (event) => {
    const status = event.target.checked;
    try {
      await this.profile.setShowHipaa({ value: status });

      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `HIPAA ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !status;
    }
  });

  resetHipaa = task(async () => {
    try {
      await this.profile.unsetShowHipaa();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  // GDPR

  saveGdpr = task(async (event) => {
    const status = event.target.checked;
    try {
      await this.profile.setShowGdpr({ value: status });
      const statusDisplay = status ? 'SHOW' : 'HIDE';
      this.notify.info(
        `GDPR ${this.intl.t('preferenceSetTo')} ${statusDisplay}`
      );
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !status;
    }
  });

  resetGdpr = task(async () => {
    try {
      await this.profile.unsetShowGdpr();
      this.notify.info(this.intl.t('regulatoryPreferenceReset'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  @action
  onSavePcidss(event: Event) {
    this.savePcidss.perform(event);
  }

  @action
  onSaveHipaa(event: Event) {
    this.saveHipaa.perform(event);
  }

  @action
  onSaveGdpr(event: Event) {
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

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    RegulatoryPreference: typeof RegulatoryPreferenceProfileComponent;
    'regulatory-preference': typeof RegulatoryPreferenceProfileComponent;
  }
}
