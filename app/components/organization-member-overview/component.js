/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects, prettier/prettier, ember/no-jquery, ember/no-get, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import { task } from 'ember-concurrency';
import { t } from 'ember-intl';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';

export default Component.extend({
  intl: service(),
  me: service(),
  notify: service('notifications'),
  modaltitle: null,
  showEditModal: false,
  localClassNameBindings: ['userDisabled:user-disabled:'], // css class - 'user-disabled'
  /*
    Workaround: as it should never first grey the background
    then make it white (blinking).
  */
  userDisabled: computed.not('member.member.isActive'),
  tagName: ["tr"],
  roles: ENUMS.ORGANIZATION_ROLES.CHOICES.slice(0, -1),
  member: null,
  organization: null,

  tUserRoleUpdated: t('userRoleUpdated'),
  tPleaseTryAgain: t('pleaseTryAgain'),
  tActivated: t('activated'),
  tDeactivated: t('deactivated'),
  tUserActivateTitle: t('userActivateTitle'),
  tUserDeactivateTitle: t('userDeactivateTitle'),

  /* Change member role */
  selectMemberRole: task(function* () {
    const role = parseInt(this.$('#org-user-role').val());

    const member = yield this.get('member');
    member.set('role', role);
    yield member.save();

  }).evented(),

  selectMemberRoleSucceeded: on('selectMemberRole:succeeded', function () {
    this.get('notify').success(this.get('tUserRoleUpdated'));
  }),

  selectMemberRoleErrored: on('selectMemberRole:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get("notify").error(errMsg);
  }),

  editMemberSetting: task(function* (attacher) {
    yield attacher.hide();
    let modaltitle = null;
    modaltitle = this.get('tUserActivateTitle')
    if (this.get('member.member.isActive')) {
      modaltitle = this.get('tUserDeactivateTitle')
    }
    yield this.set('modaltitle', modaltitle);
    yield this.set('showEditModal', true);
  }),

  changeSetting: task(function* () {
    const member = yield this.get('member.member');
    yield member.set('isActive', !member.get('isActive'));
    yield member.save()
    yield this.set('showEditModal', false)
  }).evented(),

  changeSettingErrored: on('changeSetting:errored', function (_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
    this.set('showEditModal', false)
  }),

  changeSettingSucceeded: on('changeSetting:succeeded', function () {
    const member = this.get('member.member');
    let message = member.get('isActive') ? this.get('tActivated') : this.get('tDeactivated');
    this.get('notify').success(`${message} ${member.get('username')}`);
    this.set('showEditModal', false);
  }),
  actions: {
    closeModal() {
      this.set('showEditModal', false);
    }
  }
});
