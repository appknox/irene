/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/no-get */
import Model, { attr }  from '@ember-data/model';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';

const Manualscan = Model.extend({
  appEnv: attr('string'),
  minOsVersion: attr('string'),
  contact: attr(),
  loginRequired: attr('boolean'),
  userRoles: attr(),
  vpnRequired: attr('boolean'),
  vpnDetails: attr(),
  appAction: attr('string'),
  additionalComments: attr('string'),

  filteredAppEnv: computed("appEnv", function() {
    const appEnv = parseInt(this.get("appEnv"));
    if (isNaN(appEnv)) {
      return ENUMS.APP_ENV.NO_PREFERENCE;
    }
    return appEnv;
  }),

  filteredAppAction: computed('appAction', function() {
    const appAction = parseInt(this.get("appAction"));
    if (isNaN(appAction)) {
      return ENUMS.APP_ACTION.NO_PREFERENCE;
    }
    return appAction;
  }),

  showProceedText: computed('appAction', function() {
    const appAction = this.get("appAction");
    if (appAction === "proceed") {
      return true;
    }
    return false;
  }),

  loginStatus: computed('loginRequired', function() {
    if (this.get("loginRequired")) {
      return "yes";
    }
    return "no";
  }),

  vpnStatus: computed('vpnRequired', function() {
    if (this.get("vpnRequired")) {
      return "yes";
    }
    return "no";
  })
});

export default Manualscan;
