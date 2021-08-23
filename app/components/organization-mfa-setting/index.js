import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';
import { tracked } from '@glimmer/tracking';
import Changeset from 'ember-changeset';

export default class OrganizationMfaSetting extends Component {
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
  @tracked changeset = new Object();

  // Actions

  // Action will be triggered while inserting DOM
  @action
  initComp() {
    this.changeset = new Changeset({
      isEnabled: this.organization.mandatoryMfa,
    });
  }

  // Action will be triggered while clicking at checkbox
  @action
  onToggleSwitch(event) {
    this.setToggleState(event.target.checked);
    this.toggleMFAuthFlag.perform(event.target.checked);
  }

  // Functions

  /**
   * @task to update the organization mfa state
   */
  @task(function* (state) {
    try {
      const org = this.organization;
      yield org.set('mandatoryMfa', state);
      yield org.save();
      this.notify.success(this.intl.t('changedMandatoryMFA'));
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
      this.setToggleState(!state);
    }
  })
  toggleMFAuthFlag;

  /**
   * Set toggle switch state
   * @param {Boolean} state
   */
  setToggleState(state) {
    this.changeset.set('isEnabled', state);
  }
}
