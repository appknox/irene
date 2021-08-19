import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import Changeset from 'ember-changeset';
import parseError from 'irene/utils/parse-error';
import { tracked } from '@glimmer/tracking';

export default class MFASettingComponent extends Component {
  // Dependencies
  @service me;
  @service intl;
  @service ajax;
  @service('notifications') notify;

  // Properties

  /**
   * @property {Boolean} isMfaMandateDisabled
   */
  get isMfaMandateDisabled() {
    return !this.args.user.mfaEnabled || this.toggleMFAuthFlag.isRunning;
  }

  /**
   * @property {Boolean} isUserMfaDisabled
   */
  get isUserMfaDisabled() {
    return !this.args.user.mfaEnabled;
  }

  /**
   * @property {Object} organization
   */
  get organization() {
    return this.args.organization;
  }

  /**
   * @property {Object} changeset
   */
  @tracked changeset = {};

  // Actions

  // Action will be triggered while inserting DOM
  @action
  initComp() {
    this.changeset = new Changeset({
      isEnabled: this.organization.mandatoryMfa,
    });
    console.log('this.changeset', this.changeset);
  }

  // Action will be triggered while clicking at checkbox
  @action
  onToggleSwitch() {
    this.toggleCheckboxState();
    this.toggleMFAuthFlag.perform();
  }

  // Functions

  /**
   * @task to update the organization mfa state
   */
  @task(function* () {
    try {
      const org = this.organization;
      yield org.set('mandatoryMfa', this.changeset.isEnabled);
      yield org.save();
      this.notify.success(this.intl.t('changedMandatoryMFA'));
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
      this.toggleCheckboxState();
    }
  })
  toggleMFAuthFlag;

  // Function to toggle changeset value
  toggleCheckboxState() {
    this.changeset.set('isEnabled', !this.changeset.get('isEnabled'));
  }
}
