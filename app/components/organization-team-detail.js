/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { t } from 'ember-intl';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Component.extend({
  intl: service(),
  me: service(),

  showEdit: false,
  saveEdit: false,

  tPleaseTryAgain: t("pleaseTryAgain"),
  tOrganizationTeamNameUpdated: t("organizationTeamNameUpdated"),


  /* Update team name */
  updateTeamName: task(function * () {
    const t = this.get('team');
    t.set('name', t.get('name'));
    yield t.save();
  }).evented(),

  updateTeamNameSucceeded: on('updateTeamName:succeeded', function() {
    this.get('notify').success(this.get('tOrganizationTeamNameUpdated'));
    this.send("cancelEditing");
  }),

  updateTeamNameErrored: on('updateTeamName:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
  }),


  actions: {
    updateTeam() {
      this.get('updateTeamName').perform();
    },
    editTeamName() {
      this.set('showEdit', true);
      this.set('saveEdit', true);
    },
    cancelEditing() {
      this.set('showEdit', false);
      this.set('saveEdit', false);
    }
  }

});
