/*
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 */
import DS from 'ember-data';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const User = DS.Model.extend({

  i18n: Ember.inject.service(),

  uuid: DS.attr('string'),
  lang: DS.attr('string'),
  username: DS.attr('string'),
  email: DS.attr('string'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  ownedProjects: DS.hasMany('project', {inverse:'owner'}),
  projects: DS.hasMany('project'),
  teams: DS.hasMany('team', {inverse: 'users'}),
  ownedTeams: DS.hasMany('team', {inverse: 'owner'}),
  pricings: DS.hasMany('pricing'),
  submissions: DS.hasMany('submission', {inverse:'user'}),
  namespaces: DS.attr('string'),
  collaborations: DS.hasMany('collaboration', {inverse:'user'}),
  expiryDate: DS.attr('date'),
  devknoxExpiry: DS.attr('date'),
  projectCount: DS.attr('number'),
  hasGithubToken: DS.attr('boolean'),
  hasJiraToken: DS.attr('boolean'),
  socketId: DS.attr('string'),
  limitedScans: DS.attr('boolean'),
  scansLeft: DS.attr('number'),
  githubRedirectUrl: DS.attr('string'),
  billingHidden: DS.attr('boolean'),
  mfaMethod: DS.attr('number'),
  mfaSecret: DS.attr('string'),
  isTrial: DS.attr('boolean'),
  intercomHash: DS.attr('string'),

  tProject: t("project"),
  tProjects: t("projects"),
  tNoProject: t("noProject"),

  provisioningURL: (function() {
    const mfaSecret = this.get("mfaSecret");
    const email = this.get("email");
    return `otpauth://totp/Appknox:${email}?secret=${mfaSecret}&issuer=Appknox`;
  }).property("mfaSecret", "email"),

  mfaEnabled: (function() {
    const mfaMethod = this.get("mfaMethod");
    if (mfaMethod === ENUMS.MFA_METHOD.TOTP) {
      return true;
    }
    return false;
  }).property("mfaMethod"),

  totalProjects: (function() {
    const tProject = this.get("tProject");
    const tNoProject = this.get("tNoProject");
    const projectCount = this.get("projectCount");
    const tProjects = this.get("tProjects").string.toLowerCase();
    if (projectCount === 0) {
      return tNoProject;
    } else if (projectCount === 1) {
      return `${projectCount} ${tProject}`;
    }
    return `${projectCount} ${tProjects}`;
  }).property("projectCount"),

  ifBillingIsNotHidden: (function() {
    const billingHidden = this.get('billingHidden');
    return !billingHidden;
  }).property('billingHidden'),

  getExpiryDate: (function() {
    let expiryDate;
    if (ENV.isAppknox) {
      return expiryDate = this.get("expiryDate");
    } else {
      return expiryDate = this.get("devknoxExpiry");
    }
  }).property("expiryDate"),

  hasExpiryDate: (function() {
    const getExpiryDate = this.get("getExpiryDate");
    if (Ember.isEmpty(getExpiryDate)) {
      return false;
    } else {
      return true;
    }
  }).property("getExpiryDate"),

  expiryText: (function() {
    const currentDate = new Date();
    const expiryDate = this.get("expiryDate");
    let prefix = "subscriptionWillExpire";
    if (currentDate > expiryDate) {
      prefix = "subscriptionExpired";
    }
    return prefix;
  }).property("expiryDate"),

  namespaceItems:(function() {
    const namespaces = this.get("namespaces");
    return (namespaces != null ? namespaces.split(",") : undefined);
  }).property("namespaces"),

  namespacesCount: Ember.computed.alias('namespaces.length'),

  hasNamespace: Ember.computed.gt('namespacesCount', 0),

  hasProject: Ember.computed.gt('projectCount', 0)
});

export default User;
