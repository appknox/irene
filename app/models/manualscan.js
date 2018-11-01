import DS from 'ember-data';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';

const Manualscan = DS.Model.extend({
  appEnv: DS.attr('string'),
  minOsVersion: DS.attr('string'),
  contact: DS.attr(),
  loginRequired: DS.attr('boolean'),
  userRoles: DS.attr(),
  vpnRequired: DS.attr('boolean'),
  vpnDetails: DS.attr(),
  appAction: DS.attr('string'),
  additionalComments: DS.attr('string'),

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
