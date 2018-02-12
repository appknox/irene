/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import DS from 'ember-data';
import ENUMS from 'irene/enums';

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

  filteredAppEnv: (function() {
    const appEnv = parseInt(this.get("appEnv"));
    if (isNaN(appEnv)) {
      return ENUMS.APP_ENV.NO_PREFERENCE;
    }
    return appEnv;
  }).property("appEnv"),

  filteredAppAction: (function() {
    const appAction = parseInt(this.get("appAction"));
    if (isNaN(appAction)) {
      return ENUMS.APP_ACTION.NO_PREFERENCE;
    }
    return appAction;  
  }).property("appAction"),

  showProceedText: (function() {
    const appAction = this.get("appAction");
    if (appAction === "proceed") {
      return true;
    }
    return false;
  }).property("appAction"),

  loginStatus: (function() {
    const loginRequired = this.get("loginRequired");
    if (this.get("loginRequired")) {
      return "yes";
    }
    return "no";
  }).property("loginRequired"),

  vpnStatus: (function() {
    const vpnRequired = this.get("vpnRequired");
    if (this.get("vpnRequired")) {
      return "yes";
    }
    return "no";
  }).property("vpnRequired")
});

export default Manualscan;
