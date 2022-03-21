/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-component-lifecycle-hooks, ember/no-get, ember/require-return-from-computed, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default Component.extend({
    intl: service(),
    ajax: service(),
    me: service(),
    organization: service('organization'),
    router: service('router'),
    notify: service('notifications'),

    isNamespaces: true,
    isMembers: false,
    isTeams: false,
    showHide: true,
    editSave: false,
    isSettings: false,

    tOrganizationNameUpdated: t("organizationNameUpdated"),


    /* Initialise tabs state */
    didInsertElement() {
this._super(...arguments);
      const route = this.get('router.currentRouteName');
      const routeName = route.split(".")[2];
      if(routeName === "teams" || routeName === "team") {
        this.set('isNamespaces', false);
        this.set('isMembers', false);
        this.set('isTeams', true);
        this.set('isSettings', false);
      }
      else if(routeName === "members") {
        this.set('isNamespaces', false);
        this.set('isMembers', true);
        this.set('isTeams', false);
        this.set('isSettings', false);
      }
      else if(routeName === "settings") {
        this.set('isNamespaces', false);
        this.set('isMembers', false);
        this.set('isTeams', false);
        this.set('isSettings', true);
      }
    },

    /* Check if org name is empty */
    orgNameDoesNotExist: computed('organization', function() {
      return this.get('organization').selected.get('name') === '';
    }),


    /* Edit organization name */
    updateOrgName: task(function * () {
      const org = this.get('organization').selected;
      yield org.set('name', org.get('name'));
      yield org.save()
    }).evented(),

    updateOrgNameSucceeded: on('updateOrgName:succeeded', function() {
      this.get('notify').success(this.get('tOrganizationNameUpdated'));
      this.send("cancelEditing");
      this.set('orgNameDoesNotExist', false);
      triggerAnalytics('feature', ENV.csb.updateOrgName);
    }),

    updateOrgNameErrored: on('updateOrgName:errored', function(_, err) {
      let errMsg = this.get('tPleaseTryAgain');
      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if(err.message) {
        errMsg = err.message;
      }

      this.get("notify").error(errMsg);
    }),


    /* Set active tab */
    namespaceClass: computed('isNamespaces', function() {
      if (this.get('isNamespaces')){
        return 'is-active';
      }
    }),
    memberClass: computed('isMembers', function() {
      if (this.get('isMembers')){
        return 'is-active';
      }
    }),
    teamClass: computed('isTeams', function() {
      if (this.get('isTeams')){
        return 'is-active';
      }
    }),
    settingsClass: computed('isSettings', function() {
      if (this.get('isSettings')){
        return 'is-active';
      }
    }),


    actions: {

      /* Edit controls visibility */
      editOrganization() {
        this.set('showHide', false);
        this.set('editSave', true);
      },
      cancelEditing() {
        this.set('showHide', true);
        this.set('editSave', false);
      },

      /* Select tab */
      displayNamespaces() {
        this.set('isNamespaces', true);
        this.set('isMembers', false);
        this.set('isTeams', false);
        this.set('isSettings', false);
      },
      displayMembers() {
        this.set('isNamespaces', false);
        this.set('isMembers', true);
        this.set('isTeams', false);
        this.set('isSettings', false);
      },
      displayTeams() {
        this.set('isNamespaces', false);
        this.set('isMembers', false);
        this.set('isTeams', true);
        this.set('isSettings', false);
      },
      displaySettings() {
        this.set('isNamespaces', false);
        this.set('isMembers', false);
        this.set('isTeams', false);
        this.set('isSettings', true);
      },

    }
});
